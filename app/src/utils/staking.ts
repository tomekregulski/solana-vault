import * as anchor from '@project-serum/anchor';
import { Provider } from '@project-serum/anchor';
import idl from '../idl.json';
import { PublicKey, Connection } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getMint,
  // createAssociatedTokenAccount,
  getAccount,
} from '@solana/spl-token';

import {
  ownerWalletKeypair,
  payerKeypair,
  escrowWalletKeypair,
  // escrowWallet2Keypair,
} from './utils/users';

// let token_mint = '9agr4P3EJ82iJn3vAr9YdfVmfDWgQSrSZMe3UxEDzSpY'; // 1
// let token_mint = '4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'; // 2
// let tokenPk = new PublicKey(token_mint);

// let mintA = null;
// @ts-ignore
let nftAccount;
// @ts-ignore
let initializerNFTAccount;
// @ts-ignore
let nftTokenAccount;
// @ts-ignore
let vault_account_pda = null;
let vault_account_bump = null;
// @ts-ignore
let vault_authority_pda = null;

// let initializerTokenAccountA;

const initializerAmount = 1;
console.log('/////////');
// const escrowAccount = anchor.web3.Keypair.generate();
const escrowAccount = escrowWalletKeypair; // 1
// const escrowAccount = escrowWallet2Keypair; // 2
console.log('escrow');
console.log(escrowAccount.publicKey.toString());
// const payer = anchor.web3.Keypair.generate();
const payer = payerKeypair;
console.log(payer.publicKey.toString());
// const mintAuthority = anchor.web3.Keypair.generate();
// console.log(mintAuthority.publicKey.toString());
const initializerMainAccount = ownerWalletKeypair;
// const initializerMainAccount = anchor.web3.Keypair.generate();
console.log(initializerMainAccount.publicKey.toString());
console.log('/////////');

export const initialize = async (
  connection: Connection,
  tokenPk: PublicKey,
  provider: Provider
) => {
  console.log('nft account');
  nftAccount = await getMint(connection, tokenPk);
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
  console.log('FROM ATA NFT');
  console.log(initializerNFTAccount);
  nftTokenAccount = await getAccount(
    provider.connection,
    initializerNFTAccount[0].pubkey
  );
  console.log(nftTokenAccount);
  // console.log(initializerNFTAccount[0].account.data);
  // console.log(initializerNFTAccount[0].account.owner);
  // console.log(initializerNFTAccount[0].account.data.parsed.info.owner);
  // console.log(initializerNFTAccount[0].account.data.parsed.info.tokenAmount);
  // console.log(initializerNFTAccount[0].account.owner);
  return 'init successful';
};

// @ts-ignore
export const stake = async (provider: Provider, program) => {
  // need vaults that are token-specific
  const [_vault_account_pda, _vault_account_bump] =
    await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode('vault'))],
      program.programId
    );
  vault_account_pda = _vault_account_pda;
  vault_account_bump = _vault_account_bump;
  console.log('Vault Account');
  // console.log(vault_account_pda);
  console.log(vault_account_pda.toString());
  // console.log(vault_account_bump);

  const [_vault_authority_pda, _vault_authority_bump] =
    await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode('escrow'))],
      program.programId
    );

  console.log('amount');
  // @ts-ignore
  console.log(nftTokenAccount.address);
  // @ts-ignore
  console.log(nftTokenAccount.amount);
  console.log('attempting transfer...');
  console.log(program);
  console.log(program.account);

  await program.rpc.initialize(
    vault_account_bump,
    new anchor.BN(initializerAmount),
    {
      accounts: {
        initializer: initializerMainAccount.publicKey,
        // mint: mintA,
        // @ts-ignore
        mint: nftAccount.address,
        vaultAccount: vault_account_pda,
        // initializerDepositTokenAccount: initializerTokenAccountA,
        // @ts-ignore
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
    // @ts-ignore
    initializerNFTAccount[0].pubkey
  );
  console.log(nftTokenAccount);

  vault_authority_pda = _vault_authority_pda;
  console.log('Vault Authority PDA');
  console.log(vault_authority_pda.toString());

  let _escrowAccount = await program.account.escrowAccount.fetch(
    escrowAccount.publicKey
  );

  console.log(_escrowAccount);
};

// @ts-ignore
export const unstake = async (provider: Provider, program) => {
  console.log('attempting cancel...');

  await program.rpc.cancel({
    accounts: {
      initializer: initializerMainAccount.publicKey,
      // initializerDepositTokenAccount: initializerTokenAccountA,
      // @ts-ignore
      initializerDepositTokenAccount: nftTokenAccount.address,
      // @ts-ignore
      vaultAccount: vault_account_pda,
      // @ts-ignore
      vaultAuthority: vault_authority_pda,
      escrowAccount: escrowAccount.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    signers: [initializerMainAccount],
  });

  console.log('cancel successful!');
  // @ts-ignore
  console.log(vault_authority_pda);
  nftTokenAccount = await getAccount(
    provider.connection,
    // @ts-ignore
    initializerNFTAccount[0].pubkey
  );
  console.log(nftTokenAccount);
};
