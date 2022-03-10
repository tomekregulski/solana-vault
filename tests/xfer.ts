import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Xfer } from '../target/types/xfer';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getMint,
  createAssociatedTokenAccount,
  getAccount,
  mintToChecked,
  transferChecked,
} from '@solana/spl-token';
import { assert } from 'chai';
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import {
  ownerWalletKeypair,
  payerKeypair,
  escrowWalletKeypair,
  escrowWallet2Keypair,
  rewardMintAuthorityKeypair,
} from './utils/users';
import { token } from '@project-serum/anchor/dist/cjs/utils';

describe('xfer', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Xfer as Program<Xfer>;

  // Reward Mint
  const rewardMint = '5wwzrurTXDNHDDrHw2PS78Ev38Hd9f7askUeVzDsnnQ7';
  const rewardMintPk = new PublicKey(rewardMint);
  let ownerRewardAta;
  // Stuck token
  // const testMint = new PublicKey(
  //   '9agr4P3EJ82iJn3vAr9YdfVmfDWgQSrSZMe3UxEDzSpY'
  // );

  const initializerAmount = 1;
  console.log('/////////');
  const payer = payerKeypair;
  console.log(payer.publicKey.toString());
  const mintAuthority = anchor.web3.Keypair.generate();
  console.log(mintAuthority.publicKey.toString());
  const initializerMainAccount = ownerWalletKeypair;
  console.log(initializerMainAccount.publicKey.toString());
  console.log('/////////');

  let tokens = null;

  const tokenArray = [
    // stuck token
    // new PublicKey('4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'),
    // new PublicKey('mpPGBiedL26AMGz58EKaLR1X692eVD6QoXwxXm6LWjX'),
    // new PublicKey('2snK4sppZMRpLMvnGxPiXxCvmbdhtaVCHkPTxZmCq7AZ'),
    new PublicKey('AzNjw6AtwrEd36Ec42Cn5GosDe7CHJwfeuoZpx7Mz1Nm'),
  ];

  const tempToken = new PublicKey(
    'AzNjw6AtwrEd36Ec42Cn5GosDe7CHJwfeuoZpx7Mz1Nm'
  );

  const tokenAccountsArray = [];

  const findTokenAccount = async (tokenPk) => {
    const tokenAccount = await getMint(provider.connection, tokenPk);
    tokenAccountsArray.push(tokenAccount);
  };

  const findTokenAccounts = async (array) => {
    const results = [];
    for (const token of array) {
      const ATA = (
        await provider.connection.getParsedTokenAccountsByOwner(
          initializerMainAccount.publicKey as PublicKey,
          {
            mint: token as PublicKey,
          }
        )
      ).value;
      results.push(ATA[0]);
    }
    return results;
  };

  it('Initializes program state', async () => {
    tokens = await findTokenAccounts(tokenArray);
    console.log('array of ATAs');
    console.log(tokens);
    let _allEscrow = await program.account.escrowAccount.all();

    // _allEscrow.forEach((escrow) => {
    //   console.log(escrow);
    //   console.log(escrow.account.created.toString());
    //   console.log(escrow.account.totalRewardCollected.toString());
    //   console.log(Math.floor(Date.now() / 1000));
    // });
  });

  it('Transfers the selected tokens', async () => {
    for (const token of tokens) {
      console.log(token);
      // console.log(token.account.data);
      // NFT TOKEN ACCOUNT
      const tokenAccount = await getAccount(provider.connection, token.pubkey);
      console.log(tokenAccount);

      const tokenMintPk = token.account.data.parsed.info.mint;
      const tokenPk = new PublicKey(tokenMintPk);

      const escrowTest = anchor.web3.Keypair.generate();

      const [_vault_account_pda, _vault_account_bump] =
        await PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode('vault')),
            tokenPk.toBuffer(),
          ],
          program.programId
        );

      const vault_account_pda = _vault_account_pda;
      const vault_account_bump = _vault_account_bump;

      console.log('Vault Account');
      console.log(vault_account_pda.toString());

      console.log('attempting transfer...');

      await program.rpc.initialize(
        vault_account_bump,
        new anchor.BN(initializerAmount),
        {
          accounts: {
            initializer: initializerMainAccount.publicKey,
            mint: tokenPk,
            vaultAccount: vault_account_pda,
            initializerDepositTokenAccount: tokenAccount.address, /////////////
            escrowAccount: escrowTest.publicKey,
            escrowAccountPk: escrowTest.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          instructions: [
            await program.account.escrowAccount.createInstruction(escrowTest),
          ],
          signers: [escrowTest, initializerMainAccount],
        }
      );
    }

    console.log('tranfers successful!');

    let allStakedTokens = await program.account.escrowAccount.all();

    console.log(allStakedTokens);
    console.log('/////////////////////////');
  });

  it('Distributes rewards to stakers', async () => {
    console.log('attempting distribution...');

    let rewardMintAccount = await getMint(provider.connection, rewardMintPk);
    console.log('rewardMintAccount');
    console.log(rewardMintAccount);

    let _allEscrow = await program.account.escrowAccount.all();
    let unstakeMint = _allEscrow.filter(
      (token) => token.account.mint.toString() === tempToken.toString()
    );
    console.log('from escrow filter');
    console.log(unstakeMint[0].account.initializerKey);
    console.log('from ownerWallet');
    console.log(ownerWalletKeypair.publicKey);

    // console.log('ownerWallet ATA');
    // ownerRewardAta = (
    //   await provider.connection.getParsedTokenAccountsByOwner(
    //     ownerWalletKeypair.publicKey as PublicKey,
    //     {
    //       mint: rewardMintPk as PublicKey,
    //     }
    //   )
    // ).value;

    // console.log('ownerRewardAta');
    // console.log(ownerRewardAta);
    // let tokenAccount = await getAccount(
    //   provider.connection,
    //   ownerRewardAta[0].pubkey
    // );
    // console.log('tokenAccount');
    // console.log(tokenAccount);

    console.log('retrieved from escrow ATA');
    let retrievedRewardAta = (
      await provider.connection.getParsedTokenAccountsByOwner(
        ownerWalletKeypair.publicKey as PublicKey,
        {
          mint: rewardMintPk as PublicKey,
        }
      )
    ).value;

    // console.log('retrievedRewardAta');
    // console.log(ownerRewardAta);
    let retrievedTokenAccount = await getAccount(
      provider.connection,
      retrievedRewardAta[0].pubkey
    );
    console.log('retrievedTokenAccount');
    console.log(retrievedTokenAccount);

    console.log('/////////');
    console.log(rewardMintAuthorityKeypair.publicKey);
    console.log(initializerMainAccount.publicKey);
    console.log(unstakeMint[0].account.initializerDepositTokenAccount);
    console.log(unstakeMint[0].publicKey);
    console.log(rewardMintPk);
    console.log(retrievedRewardAta[0].pubkey);
    console.log('/////////');
    console.log(unstakeMint[0]);

    await program.rpc.distribute(new anchor.BN(500), {
      accounts: {
        authority: rewardMintAuthorityKeypair.publicKey,
        // @ts-ignore
        initializer: initializerMainAccount.publicKey,
        initializerDepositTokenAccount:
          unstakeMint[0].account.initializerDepositTokenAccount,
        escrowAccount: unstakeMint[0].publicKey,
        mint: rewardMintPk,
        to: retrievedRewardAta[0].pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    console.log('success');
  });

  it('Unstakes all tokens', async () => {
    let allStakedTokens = await program.account.escrowAccount.all();
    let unstakeMints = allStakedTokens.map((token) => {
      return token.account.mint;
    });

    console.log('all');
    console.log(allStakedTokens);
    console.log('unstake mint');
    console.log(unstakeMints);

    console.log('attempting unstake...');

    for (const stakedToken of allStakedTokens) {
      if (
        stakedToken.publicKey.toString() !==
          'coGMtFdR7CuV2sE7eor7w6hzTaEuEugQxu5zEqCF382' &&
        stakedToken.publicKey.toString() !==
          'GTno8oV1zaL2QaR9j7uMdCcmrVrq68eA33Dux96ePaFv'
      ) {
        console.log(stakedToken.publicKey.toString());
        const [_vault_account_pda, _vault_account_bump] =
          await PublicKey.findProgramAddress(
            [
              Buffer.from(anchor.utils.bytes.utf8.encode('vault')),
              stakedToken.account.mint.toBuffer(),
            ],
            program.programId
          );
        const vault_account_pda = _vault_account_pda;
        const vault_account_bump = _vault_account_bump;
        console.log(vault_account_pda);
        console.log(vault_account_bump);

        const [_vault_authority_pda, _vault_authority_bump] =
          await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode('escrow'))],
            program.programId
          );

        const vault_authority_pda = _vault_authority_pda;

        await program.rpc.cancel({
          accounts: {
            initializer: initializerMainAccount.publicKey,
            mint: stakedToken.account.mint, // variable - escrowItem.mint
            initializerDepositTokenAccount:
              stakedToken.account.initializerDepositTokenAccount, // variable | escrowItem.initializer_deposit_token_account
            vaultAccount: vault_account_pda, // variable | above
            vaultAuthority: vault_authority_pda, // variable | above
            escrowAccount: stakedToken.publicKey, // variable | escrowItem.escrow_pk
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [initializerMainAccount],
        });
      } else {
        console.log('stuck token');
      }
    }

    let _allEscrow = await program.account.escrowAccount.all();

    console.log(_allEscrow);
  });
});
