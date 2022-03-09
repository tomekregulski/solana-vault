import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Provider } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import idl from '../idl.json';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

export const preflightCommitment = 'processed';
export const programID = new PublicKey(idl.metadata.address);

export const getNft = async (connection: Connection, pubkey: PublicKey) => {
  console.log(connection);
  const nftsmetadata = await Metadata.findDataByOwner(connection, pubkey);

  return nftsmetadata;
};

export const transferToken = async (
  receiverPk: String,
  connection: Connection,
  provider: Provider,
  mint: String,
  // @ts-ignore
  program
) => {
  console.log('initializing transfer');
  const mintPk: PublicKey = new PublicKey(mint);
  const toPk: PublicKey = new PublicKey(receiverPk);

  const fromAta = (
    await connection.getParsedTokenAccountsByOwner(
      provider.wallet.publicKey as PublicKey,
      {
        mint: mintPk as PublicKey,
      }
    )
  ).value;

  const toAta = (
    await connection.getParsedTokenAccountsByOwner(toPk as PublicKey, {
      mint: mintPk as PublicKey,
    })
  ).value;

  // @ts-ignore
  const tx = await program.transaction.transferToken({
    accounts: {
      sender: provider.wallet.publicKey as PublicKey,
      senderToken: fromAta[0].pubkey,
      receiverToken: toAta[0].pubkey,
      mint: mintPk,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    signers: [provider.wallet],
  });
  tx.feePayer = await provider.wallet.publicKey;
  let blockhashObj = await provider.connection.getRecentBlockhash();
  tx.recentBlockhash = await blockhashObj.blockhash;
  // tx.sign(payer);
  const signedTransaction = await provider.wallet.signTransaction(tx);
  console.log(signedTransaction);
  // // @ts-ignore
  var test = signedTransaction.serialize();
  const transactionId = await provider.connection.sendRawTransaction(test);
  console.log(transactionId);
  console.log(
    'original owner token balance: ',
    // @ts-ignore
    await program.provider.connection.getTokenAccountBalance(fromAta[0].pubkey)
  );
  console.log(
    'receiver (sender here) token balance: ',
    // @ts-ignore
    await program.provider.connection.getTokenAccountBalance(toAta[0].pubkey)
  );
};

const payerSeed = [
  253, 186, 191, 154, 16, 194, 47, 179, 68, 212, 3, 117, 44, 69, 94, 104, 111,
  217, 153, 220, 221, 47, 239, 105, 87, 142, 38, 193, 125, 214, 253, 84, 177,
  141, 132, 130, 85, 208, 102, 158, 207, 101, 160, 95, 207, 171, 238, 204, 110,
  134, 145, 224, 56, 50, 66, 126, 182, 96, 146, 39, 183, 234, 227, 196,
].slice(0, 32);

export const feePayer = Keypair.fromSeed(Uint8Array.from(payerSeed));
