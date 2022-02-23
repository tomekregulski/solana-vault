use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const AMOUNT: u64 = 1;

#[program]
pub mod staking {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {

        // SOMETHING
        // CREATE POOL?????
        Ok(())
    }
    pub fn stake(ctx: Context<Stake>) -> ProgramResult {

        // transfer token from User to Vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.program_vault.to_account_info(),
            authority: ctx.accounts.authority.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone(); // TOKEN_PROGRAM_ID
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, AMOUNT)?;
        Ok(())
    }
    pub fn unstake(ctx: Context<Unstake>, nonce: u8) -> ProgramResult {
        // actually want to think about storing the token account PK and nonce u8 on a data account, PK can then just be brought in via as_ref()
        let seeds = &[ctx.accounts.mint_account.to_account_info().key.as_ref(), &[nonce], ];
        let signer = &[&seeds[..]];
        // transfer token from User to Vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.program_vault.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: ctx.accounts.program_signer.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone(); // TOKEN_PROGRAM_ID
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, AMOUNT)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
