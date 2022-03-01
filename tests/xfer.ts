import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Xfer } from '../target/types/xfer';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getMint, getAccount } from '@solana/spl-token';
import { assert } from 'chai';
import 'dotenv';

import {
  ownerWalletKeypair,
  payerKeypair,
  escrowWalletKeypair,
  escrowWallet2Keypair,
} from './utils/users';

// TODO: write assertions and fail-case tests

describe('xfer', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Xfer as Program<Xfer>;

  let token_mint = process.env.TOKEN_MINT_A;
  let tokenPk = new PublicKey(token_mint);

  let nftAccount;
  let initializerNFTAccount;
  let nftTokenAccount;

  let vault_account_pda = null;
  let vault_account_bump = null;
  let vault_authority_pda = null;

  const initializerAmount = 1;
  const escrowAccount = escrowWalletKeypair; // 1
  // const escrowAccount = escrowWallet2Keypair; // 2
  const initializerMainAccount = ownerWalletKeypair;

  it('Initializes program state', async () => {
    console.log('nft account');
    nftAccount = await getMint(provider.connection, tokenPk);
    console.log(nftAccount); // === mintAccount
    console.log(nftAccount.address.toString());

    initializerNFTAccount = (
      await provider.connection.getParsedTokenAccountsByOwner(
        initializerMainAccount.publicKey as PublicKey,
        {
          mint: tokenPk as PublicKey,
        }
      )
    ).value;

    nftTokenAccount = await getAccount(
      provider.connection,
      initializerNFTAccount[0].pubkey
    );
  });

  it('Initializes transfer', async () => {
    // TODO: need PDA seeds to be more specific
    const [_vault_account_pda, _vault_account_bump] =
      await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('vault'))],
        program.programId
      );
    vault_account_pda = _vault_account_pda;
    vault_account_bump = _vault_account_bump;

    const [_vault_authority_pda, _vault_authority_bump] =
      await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('escrow'))],
        program.programId
      );

    console.log('attempting transfer...');

    await program.rpc.initialize(
      vault_account_bump,
      new anchor.BN(initializerAmount),
      {
        accounts: {
          initializer: initializerMainAccount.publicKey,
          mint: nftAccount.address,
          vaultAccount: vault_account_pda,
          initializerDepositTokenAccount: nftTokenAccount.address,
          escrowAccount: escrowAccount.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
          await program.account.escrowAccount.createInstruction(escrowAccount),
        ],
        signers: [escrowAccount, initializerMainAccount],
      }
    );

    console.log('tranfer successful!');

    nftTokenAccount = await getAccount(
      provider.connection,
      initializerNFTAccount[0].pubkey
    );
    console.log(nftTokenAccount);

    vault_authority_pda = _vault_authority_pda;

    let _escrowAccount = await program.account.escrowAccount.fetch(
      escrowAccount.publicKey
    );

    console.log(_escrowAccount);
  });
  it('Cancels', async () => {
    console.log('attempting cancel...');
    await program.rpc.cancel({
      accounts: {
        initializer: initializerMainAccount.publicKey,
        initializerDepositTokenAccount: nftTokenAccount.address,
        vaultAccount: vault_account_pda,
        vaultAuthority: vault_authority_pda,
        escrowAccount: escrowAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [initializerMainAccount],
    });

    console.log('cancel successful!');

    nftTokenAccount = await getAccount(
      provider.connection,
      initializerNFTAccount[0].pubkey
    );
    console.log(nftTokenAccount);
  });
});
