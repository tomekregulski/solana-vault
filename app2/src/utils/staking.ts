import * as anchor from '@project-serum/anchor';
import { Provider } from '@project-serum/anchor';
import idl from '../idl.json';
import { PublicKey, Connection, Transaction } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getMint,
    createAssociatedTokenAccount,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    getAccount,
} from '@solana/spl-token';
import { ownerWalletKeypair, payerKeypair, escrowWalletKeypair, rewardMintAuthorityKeypair } from './utils/users';

const initializerAmount = 1;
// console.log('/////////');
// // const escrowAccount = anchor.web3.Keypair.generate();
// const escrowAccount = escrowWalletKeypair; // 1
// // const escrowAccount = escrowWallet2Keypair; // 2
// console.log('escrow');
// console.log(escrowAccount.publicKey.toString());
// // const payer = anchor.web3.Keypair.generate();
// const payer = payerKeypair;
// console.log(payer.publicKey.toString());
// // const mintAuthority = anchor.web3.Keypair.generate();
// // console.log(mintAuthority.publicKey.toString());
// const initializerMainAccount = ownerWalletKeypair;
// // const initializerMainAccount = anchor.web3.Keypair.generate();
// console.log(initializerMainAccount.publicKey.toString());
// console.log('/////////');

const rewardMint = '5wwzrurTXDNHDDrHw2PS78Ev38Hd9f7askUeVzDsnnQ7';
const rewardMintPk = new PublicKey(rewardMint);

// @ts-ignore
export const stake = async (provider: Provider, program, tokenAccount) => {
    const tokenMintPk = tokenAccount.account.data.parsed.info.mint;
    const tokenPk = new PublicKey(tokenMintPk);

    const initializerTokenAccount = await getAccount(provider.connection, tokenAccount.pubkey);

    const escrowKeypair = anchor.web3.Keypair.generate();

    const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), tokenPk.toBuffer()],
        program.programId
    );

    const vault_account_pda = _vault_account_pda;
    const vault_account_bump = _vault_account_bump;

    console.log('attempting transfer...');

    const sender = program.provider.wallet;

    const tx = await program.transaction.initialize(vault_account_bump, new anchor.BN(initializerAmount), {
        accounts: {
            initializer: sender.publicKey,
            mint: tokenPk,
            vaultAccount: vault_account_pda,
            initializerDepositTokenAccount: initializerTokenAccount.address, /////////////
            escrowAccount: escrowKeypair.publicKey,
            escrowAccountPk: escrowKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [await program.account.escrowAccount.createInstruction(escrowKeypair)],
        signers: [escrowKeypair, sender],
    });
    tx.feePayer = await program.provider.wallet.publicKey;
    const blockhashObj = await provider.connection.getRecentBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(escrowKeypair);
    const signedTransaction = await program.provider.wallet.signTransaction(tx);
    console.log(signedTransaction);
    // // @ts-ignore
    const test = signedTransaction.serialize();
    const transactionId = await provider.connection.sendRawTransaction(test);
    console.log(transactionId);

    console.log('tranfers successful!');

    const allStakedTokens = await program.account.escrowAccount.all();

    console.log(allStakedTokens);
    console.log('/////////////////////////');
};

// @ts-ignore
export const unstake = async (provider: Provider, program, stakedToken) => {
    console.log('attempting unstake...');
    if (
        stakedToken.publicKey.toString() !== 'coGMtFdR7CuV2sE7eor7w6hzTaEuEugQxu5zEqCF382' &&
        stakedToken.publicKey.toString() !== 'GTno8oV1zaL2QaR9j7uMdCcmrVrq68eA33Dux96ePaFv'
    ) {
        console.log(stakedToken.publicKey.toString());
        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), stakedToken.account.mint.toBuffer()],
            program.programId
        );
        const vault_account_pda = _vault_account_pda;
        const vault_account_bump = _vault_account_bump;
        console.log(vault_account_pda);
        console.log(vault_account_bump);

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode('escrow'))],
            program.programId
        );

        const vault_authority_pda = _vault_authority_pda;
        const sender = program.provider.wallet;

        const tx = await program.transaction.cancel({
            accounts: {
                initializer: sender.publicKey,
                mint: stakedToken.account.mint, // variable - escrowItem.mint
                initializerDepositTokenAccount: stakedToken.account.initializerDepositTokenAccount, // variable | escrowItem.initializer_deposit_token_account
                vaultAccount: vault_account_pda, // variable | above
                vaultAuthority: vault_authority_pda, // variable | above
                escrowAccount: stakedToken.publicKey, // variable | escrowItem.escrow_pk
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [sender],
        });
        tx.feePayer = await program.provider.wallet.publicKey;
        const blockhashObj = await provider.connection.getRecentBlockhash();
        tx.recentBlockhash = await blockhashObj.blockhash;
        const signedTransaction = await program.provider.wallet.signTransaction(tx);
        console.log(signedTransaction);
        // // @ts-ignore
        const test = signedTransaction.serialize();
        const transactionId = await provider.connection.sendRawTransaction(test);
        console.log(transactionId);

        const _allEscrow = await program.account.escrowAccount.all();
        console.log(_allEscrow);

        console.log('successfully unstaked!');
        // await program.rpc.cancel({
        //     accounts: {
        //         initializer: initializerMainAccount.publicKey,
        //         mint: stakedToken.account.mint, // variable - escrowItem.mint
        //         initializerDepositTokenAccount: stakedToken.account.initializerDepositTokenAccount, // variable | escrowItem.initializer_deposit_token_account
        //         vaultAccount: vault_account_pda, // variable | above
        //         vaultAuthority: vault_authority_pda, // variable | above
        //         escrowAccount: stakedToken.publicKey, // variable | escrowItem.escrow_pk
        //         tokenProgram: TOKEN_PROGRAM_ID,
        //     },
        //     signers: [initializerMainAccount],
        // });
        // await program.rpc.cancel({
        //     accounts: {
        //         initializer: initializerMainAccount.publicKey,
        //         // initializerDepositTokenAccount: initializerTokenAccountA,
        //         // @ts-ignore
        //         initializerDepositTokenAccount: nftTokenAccount.address,
        //         // @ts-ignore
        //         vaultAccount: vault_account_pda,
        //         // @ts-ignore
        //         vaultAuthority: vault_authority_pda,
        //         escrowAccount: escrowAccount.publicKey,
        //         tokenProgram: TOKEN_PROGRAM_ID,
        //     },
        //     signers: [initializerMainAccount],
        // });

        console.log('cancel successful!');
        // @ts-ignore
        console.log(vault_authority_pda);
    } else {
        console.log('stuck token');
    }
};

// @ts-ignore
export const collectTokenRewards = async (provider: Provider, program, token) => {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const lastRewardCollection = parseInt(token[2].account.lastRewardCollection.toString());
    const duration = nowInSeconds - lastRewardCollection;
    console.log(duration);
    if (duration > 60) {
        const rewardMintAccount = await getMint(provider.connection, rewardMintPk);
        console.log('rewardMintAccount');
        console.log(rewardMintAccount);

        console.log(program.provider.wallet.publicKey);
        let ownerRewardAta;
        ownerRewardAta = (
            await provider.connection.getParsedTokenAccountsByOwner(program.provider.wallet.publicKey as PublicKey, {
                mint: rewardMintPk as PublicKey,
            })
        ).value;

        const sender = program.provider.wallet;
        console.log(ownerRewardAta);

        if (ownerRewardAta.length === 0) {
            const toAta = await getAssociatedTokenAddress(
                rewardMintPk, // mint
                sender.publicKey // owner
            );
            console.log(`ATA: ${toAta.toBase58()}`);

            const toTx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    provider.wallet.publicKey, // payer
                    toAta, // ata
                    sender.publicKey, // owner
                    rewardMintPk // mint
                )
            );
            toTx.feePayer = await provider.wallet.publicKey;
            console.log(toTx);
            const blockhashObj = await provider.connection.getRecentBlockhash();
            toTx.recentBlockhash = await blockhashObj.blockhash;
            const signedTransaction2 = await provider.wallet.signTransaction(toTx);
            console.log(signedTransaction2);
            // // // @ts-ignore
            const test = signedTransaction2.serialize();
            const transactionId2 = await provider.connection.sendRawTransaction(test);
            console.log(transactionId2);
            console.log(`txhash: ${await program.connection.sendTransaction(toTx, [provider.wallet])}`);
            // const ata = await createAssociatedTokenAccount(
            //     program.connection, // connection
            //     rewardMintAuthorityKeypair, // fee payer
            //     rewardMintPk, // mint
            //     sender.publicKey // owner,
            // );
            ownerRewardAta = (
                await provider.connection.getParsedTokenAccountsByOwner(
                    program.provider.wallet.publicKey as PublicKey,
                    {
                        mint: rewardMintPk as PublicKey,
                    }
                )
            ).value;
        }

        // console.log(ownerRewardAta);
        // @ts-ignore
        // const ownerRewardTokenAccount = await getAccount(provider.connection, ownerRewardAta[0].pubkey);

        const tx = await program.rpc.distribute(new anchor.BN(duration), {
            accounts: {
                authority: rewardMintAuthorityKeypair.publicKey,
                initializer: sender.publicKey,
                initializerDepositTokenAccount: token[2].account.initializerDepositTokenAccount,
                escrowAccount: token[2].account.escrowPk,
                mint: rewardMintPk,
                // @ts-ignore
                to: ownerRewardAta[0].pubkey,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [rewardMintAuthorityKeypair],
        });
        console.log('collection successful');
        console.log(tx);
    } else {
        alert('Please wait a bit longer');
    }
};

// // @ts-ignore
// export const unstakeMultipleTokens = async (provider: Provider, program, tokens) => {
//     // @ts-ignore
//     // const unstakeMints = tokens.map((token) => {
//     //     return token.account.mint;
//     // });

//     console.log('all');
//     console.log(tokens);
//     // console.log('unstake mint');
//     // console.log(unstakeMints);

//     console.log('attempting unstake...');

//     for (const stakedToken of tokens) {
//         if (
//             stakedToken.publicKey.toString() !== 'coGMtFdR7CuV2sE7eor7w6hzTaEuEugQxu5zEqCF382' &&
//             stakedToken.publicKey.toString() !== 'GTno8oV1zaL2QaR9j7uMdCcmrVrq68eA33Dux96ePaFv'
//         ) {
//             console.log(stakedToken.publicKey.toString());
//             const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
//                 [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), stakedToken.account.mint.toBuffer()],
//                 program.programId
//             );
//             const vault_account_pda = _vault_account_pda;
//             const vault_account_bump = _vault_account_bump;
//             console.log(vault_account_pda);
//             console.log(vault_account_bump);

//             const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
//                 [Buffer.from(anchor.utils.bytes.utf8.encode('escrow'))],
//                 program.programId
//             );

//             const vault_authority_pda = _vault_authority_pda;
//             const sender = program.provider.wallet;

//             const tx = await program.transaction.cancel({
//                 accounts: {
//                     initializer: sender.publicKey,
//                     mint: stakedToken.account.mint, // variable - escrowItem.mint
//                     initializerDepositTokenAccount: stakedToken.account.initializerDepositTokenAccount, // variable | escrowItem.initializer_deposit_token_account
//                     vaultAccount: vault_account_pda, // variable | above
//                     vaultAuthority: vault_authority_pda, // variable | above
//                     escrowAccount: stakedToken.publicKey, // variable | escrowItem.escrow_pk
//                     tokenProgram: TOKEN_PROGRAM_ID,
//                 },
//                 signers: [sender],
//             });
//             tx.feePayer = await program.provider.wallet.publicKey;
//             const blockhashObj = await provider.connection.getRecentBlockhash();
//             tx.recentBlockhash = await blockhashObj.blockhash;
//             const signedTransaction = await program.provider.wallet.signTransaction(tx);
//             console.log(signedTransaction);
//             // // @ts-ignore
//             const test = signedTransaction.serialize();
//             const transactionId = await provider.connection.sendRawTransaction(test);
//             console.log(transactionId);

//             // await program.rpc.cancel({
//             //     accounts: {
//             //         initializer: initializerMainAccount.publicKey,
//             //         mint: stakedToken.account.mint, // variable - escrowItem.mint
//             //         initializerDepositTokenAccount: stakedToken.account.initializerDepositTokenAccount, // variable | escrowItem.initializer_deposit_token_account
//             //         vaultAccount: vault_account_pda, // variable | above
//             //         vaultAuthority: vault_authority_pda, // variable | above
//             //         escrowAccount: stakedToken.publicKey, // variable | escrowItem.escrow_pk
//             //         tokenProgram: TOKEN_PROGRAM_ID,
//             //     },
//             //     signers: [initializerMainAccount],
//             // });
//         } else {
//             console.log('stuck token');
//         }
//     }

//     const _allEscrow = await program.account.escrowAccount.all();

//     console.log(_allEscrow);
// };

// // @ts-ignore
// export const stakeMultipleTokens = async (provider: Provider, program, tokens) => {
//     for (const token of tokens) {
//         console.log(token);
//         // console.log(token.account.data);
//         // NFT TOKEN ACCOUNT
//         const tokenAccount = await getAccount(provider.connection, token.pubkey);
//         console.log(tokenAccount);

//         const tokenMintPk = token.account.data.parsed.info.mint;
//         const tokenPk = new PublicKey(tokenMintPk);

//         const escrowTest = anchor.web3.Keypair.generate();

//         const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
//             [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), tokenPk.toBuffer()],
//             program.programId
//         );

//         const vault_account_pda = _vault_account_pda;
//         const vault_account_bump = _vault_account_bump;

//         console.log('Vault Account');
//         console.log(vault_account_pda.toString());

//         console.log('attempting transfer...');

//         const sender = program.provider.wallet;

//         const tx = await program.transaction.initialize(vault_account_bump, new anchor.BN(initializerAmount), {
//             accounts: {
//                 initializer: sender.publicKey,
//                 mint: tokenPk,
//                 vaultAccount: vault_account_pda,
//                 initializerDepositTokenAccount: tokenAccount.address, /////////////
//                 escrowAccount: escrowTest.publicKey,
//                 escrowAccountPk: escrowTest.publicKey,
//                 systemProgram: anchor.web3.SystemProgram.programId,
//                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//             },
//             instructions: [await program.account.escrowAccount.createInstruction(escrowTest)],
//             signers: [escrowTest, sender],
//         });
//         tx.feePayer = await program.provider.wallet.publicKey;
//         const blockhashObj = await provider.connection.getRecentBlockhash();
//         tx.recentBlockhash = await blockhashObj.blockhash;
//         tx.sign(escrowTest);
//         const signedTransaction = await program.provider.wallet.signTransaction(tx);
//         console.log(signedTransaction);
//         // // @ts-ignore
//         const test = signedTransaction.serialize();
//         const transactionId = await provider.connection.sendRawTransaction(test);
//         console.log(transactionId);

//         // await program.rpc.initialize(vault_account_bump, new anchor.BN(initializerAmount), {
//         //     accounts: {
//         //         initializer: initializerMainAccount.publicKey,
//         //         mint: tokenPk,
//         //         vaultAccount: vault_account_pda,
//         //         initializerDepositTokenAccount: tokenAccount.address, /////////////
//         //         escrowAccount: escrowTest.publicKey,
//         //         escrowAccountPk: escrowTest.publicKey,
//         //         systemProgram: anchor.web3.SystemProgram.programId,
//         //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         //         tokenProgram: TOKEN_PROGRAM_ID,
//         //     },
//         //     instructions: [await program.account.escrowAccount.createInstruction(escrowTest)],
//         //     signers: [escrowTest, initializerMainAccount],
//         // });
//     }

//     console.log('tranfers successful!');

//     const allStakedTokens = await program.account.escrowAccount.all();

//     console.log(allStakedTokens);
//     console.log('/////////////////////////');
// };

// export const collectTokenRewards = async (provider: Provider, program, token) => {
//     const nowInSeconds = Math.floor(Date.now() / 1000);
//     const lastRewardCollection = parseInt(token[2].account.lastRewardCollection.toString());
//     const duration = nowInSeconds - lastRewardCollection;
//     console.log(duration);
//     if (duration > 60) {
//         const rewardMintAccount = await getMint(provider.connection, rewardMintPk);
//         console.log('rewardMintAccount');
//         console.log(rewardMintAccount);

//         console.log(program.provider.wallet.publicKey);
//         let ownerRewardAta;
//         ownerRewardAta = (
//             await provider.connection.getParsedTokenAccountsByOwner(program.provider.wallet.publicKey as PublicKey, {
//                 mint: rewardMintPk as PublicKey,
//             })
//         ).value;

//         const sender = program.provider.wallet;
//         console.log(ownerRewardAta);

//         if (ownerRewardAta.length === 0) {
//             const toAta = await getAssociatedTokenAddress(
//                 rewardMintPk, // mint
//                 sender.publicKey // owner
//             );
//             console.log(`ATA: ${toAta.toBase58()}`);

//             const toTx = new Transaction().add(
//                 createAssociatedTokenAccountInstruction(
//                     provider.wallet.publicKey, // payer
//                     toAta, // ata
//                     sender.publicKey, // owner
//                     rewardMintPk // mint
//                 )
//             );
//             toTx.feePayer = await provider.wallet.publicKey;
//             console.log(toTx);
//             const blockhashObj = await provider.connection.getRecentBlockhash();
//             toTx.recentBlockhash = await blockhashObj.blockhash;
//             const signedTransaction2 = await provider.wallet.signTransaction(toTx);
//             console.log(signedTransaction2);
//             // // // @ts-ignore
//             const test = signedTransaction2.serialize();
//             const transactionId2 = await provider.connection.sendRawTransaction(test);
//             console.log(transactionId2);
//             console.log(`txhash: ${await program.connection.sendTransaction(toTx, [provider.wallet])}`);
//             // const ata = await createAssociatedTokenAccount(
//             //     program.connection, // connection
//             //     rewardMintAuthorityKeypair, // fee payer
//             //     rewardMintPk, // mint
//             //     sender.publicKey // owner,
//             // );
//             ownerRewardAta = (
//                 await provider.connection.getParsedTokenAccountsByOwner(
//                     program.provider.wallet.publicKey as PublicKey,
//                     {
//                         mint: rewardMintPk as PublicKey,
//                     }
//                 )
//             ).value;
//         }

//         console.log(ownerRewardAta);
//         // @ts-ignore
//         const ownerRewardTokenAccount = await getAccount(provider.connection, ownerRewardAta[0].pubkey);
//         console.log('/////////////');
//         console.log(token);
//         console.log(sender.publicKey);
//         console.log(rewardMintAuthorityKeypair.publicKey);
//         console.log(token[2].account.escrowPk);
//         console.log(rewardMintPk);
//         // @ts-ignore
//         console.log(ownerRewardAta[0].pubkey);
//         console.log(ownerRewardAta[0]);
//         // @ts-ignore
//         console.log(ownerRewardTokenAccount.address);
//         console.log(token[2].account.initializerDepositTokenAccount);
//         console.log('/////////////');

// const tx = await program.transaction.distribute(new anchor.BN(duration), {
//     accounts: {
//         authority: rewardMintAuthorityKeypair.publicKey,
//         initializer: initializerMainAccount.publicKey,
//         initializerDepositTokenAccount: token[2].account.initializerDepositTokenAccount,
//         escrowAccount: token[2].account.escrowPk,
//         mint: rewardMintPk,
//         to: ownerRewardAta[0].pubkey,
//         tokenProgram: TOKEN_PROGRAM_ID,
//     },
//     signers: [rewardMintAuthorityKeypair, sender],
// });
// tx.feePayer = await program.provider.wallet.publicKey;
// const blockhashObj = await provider.connection.getRecentBlockhash();
// tx.recentBlockhash = await blockhashObj.blockhash;
// tx.sign(rewardMintAuthorityKeypair);
// const signedTransaction = await program.provider.wallet.signTransaction(tx);
// console.log(signedTransaction);

// // // @ts-ignore
// const test = signedTransaction.serialize();
// const transactionId = await provider.connection.sendRawTransaction(test);
// console.log(transactionId);

//         const tx = await program.rpc.distribute(new anchor.BN(duration), {
//             accounts: {
//                 authority: rewardMintAuthorityKeypair.publicKey,
//                 initializer: sender.publicKey,
//                 initializerDepositTokenAccount: token[2].account.initializerDepositTokenAccount,
//                 escrowAccount: token[2].account.escrowPk,
//                 mint: rewardMintPk,
//                 // @ts-ignore
//                 to: ownerRewardAta[0].pubkey,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//             },
//             signers: [rewardMintAuthorityKeypair],
//         });
//         console.log('collection successful');
//         console.log(tx);
//     }
// };
