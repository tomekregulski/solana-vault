use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, TokenAccount, Transfer};
use spl_token::instruction::AuthorityType;

declare_id!("7xhwkYESJV7nhXfh3GwgE7rBvUMgo1oibhfYhwMSojd4");

#[program]
pub mod xfer {
    use super::*;
    const ESCROW_PDA_SEED: &[u8] = b"escrow";
    pub fn initialize(ctx: Context<Initialize>, _vault_account_bump: u8, 
        initializer_amount: u64, ) -> ProgramResult {
        ctx.accounts.escrow_account.initializer_key = *ctx.accounts.initializer.key;
        ctx.accounts
            .escrow_account
            .initializer_deposit_token_account = *ctx
            .accounts
            .initializer_deposit_token_account
            .to_account_info()
            .key;
        ctx.accounts.escrow_account.initializer_amount = initializer_amount;

        let (vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[ESCROW_PDA_SEED], ctx.program_id);
        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;

        token::transfer(
            ctx.accounts.into_transfer_to_pda_context(),
            ctx.accounts.escrow_account.initializer_amount,
        )?;
        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> ProgramResult {
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[ESCROW_PDA_SEED], ctx.program_id);
        let authority_seeds = &[&ESCROW_PDA_SEED[..], &[vault_authority_bump]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_initializer_context()
                .with_signer(&[&authority_seeds[..]]),
            ctx.accounts.escrow_account.initializer_amount,
        )?;

        token::close_account(
            ctx.accounts
                .into_close_context()
                .with_signer(&[&authority_seeds[..]]),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(vault_account_bump: u8, initializer_amount: u64)]
pub struct Initialize<'info> {
    /// CHECK: checking
    #[account(mut, signer)] // Checks the given account signed the transaction
    pub initializer: AccountInfo<'info>, // Signer of InitialEscrow instruction. To be stored in EscrowAccount
    pub mint: Account<'info, Mint>, // The account of token account for token exchange. To be stored in EscrowAccount
    #[account(
        init,
        seeds = [b"vault".as_ref()],
        bump,
        payer = initializer,
        token::mint = mint,
        token::authority = initializer,
    )]  // Notice that we used a rather complex constraint to create an token account that has a PDA key
    pub vault_account: Account<'info, TokenAccount>, // The account of token account for token exchange. To be stored in EscrowAccount
    #[account(
        mut,
        constraint = initializer_deposit_token_account.amount >= initializer_amount
    )] // Executes the given code as a constraint. The expression should evaluate to a boolean
    pub initializer_deposit_token_account: Account<'info, TokenAccount>, // The account of TokenProgram
    // pub initializer_receive_token_account: Account<'info, TokenAccount>, // The account of EscrowAccount
    #[account(zero)]
    pub escrow_account: Box<Account<'info, EscrowAccount>>, // The account of Vault, which is created by Anchor via constraints.
    /// CHECK: checking
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: checking
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    /// CHECK: checking
    #[account(mut, signer)] 
    pub initializer: AccountInfo<'info>, // The initializer of EscrowAccount
    #[account(mut)] // Marks the account as mutable and persists the state transition
    pub vault_account: Account<'info, TokenAccount>, // The program derived address
    /// CHECK: checking
    pub vault_authority: AccountInfo<'info>, // The program derived address
    #[account(mut)]
    pub initializer_deposit_token_account: Account<'info, TokenAccount>, // The address of token account for token exchange
    #[account(
        mut,
        constraint = escrow_account.initializer_key == *initializer.key,
        constraint = escrow_account.initializer_deposit_token_account == *initializer_deposit_token_account.to_account_info().key,
        close = initializer
    )] // close = <target\> // Marks the account as being closed at the end of the instruction’s execution, sending the rent exemption lamports to the specified
    pub escrow_account: Box<Account<'info, EscrowAccount>>, // The address of EscrowAccount. Have to check if the EscrowAccount follows certain constraints.
    /// CHECK: checking
    pub token_program: AccountInfo<'info>, // The address of TokenProgram
}

#[account]
pub struct EscrowAccount {
    pub initializer_key: Pubkey, // To authorize the actions properly
    pub initializer_deposit_token_account: Pubkey, // To record the deposit account of initialzer
    // pub initializer_receive_token_account: Pubkey, // To record the receiving account of initializer
    pub initializer_amount: u64, // To record how much token should the initializer transfer to taker
}

impl<'info> Initialize<'info> {
    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .initializer_deposit_token_account
                .to_account_info()
                .clone(),
            to: self.vault_account.to_account_info().clone(),
            authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault_account.to_account_info().clone(),
            current_authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

impl<'info> Cancel<'info> {
    fn into_transfer_to_initializer_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self
                .initializer_deposit_token_account
                .to_account_info()
                .clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault_account.to_account_info().clone(),
            destination: self.initializer.clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}