import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Staking } from '../target/types/staking';
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
} from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey, Keypair } from '@solana/web3.js';

describe('staking', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Staking as Program<Staking>;

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  let programSigner;

  it('Is initialized!', async () => {
    const tx = await program.rpc.initialize({});
    console.log('Your transaction signature', tx);
  });

  it('creates a PDA', async () => {
    const feePayer = await anchor.web3.Keypair.generate();
    const mint = new PublicKey('6nuE6ApVfA7pfqZ9nmC86irVnsGxdPUE1LihWKBpGzVP');
    const mintAccount = await getMint(connection, mint);
    console.log('Mint Account:');
    console.log(mintAccount);

    const [_programSigner, nonce] =
      await anchor.web3.PublicKey.findProgramAddress(
        [mint.toBuffer()],
        program.programId
      );

    programSigner = _programSigner;
    console.log('Program Signer:');
    console.log(programSigner);

    const ownerTokenAccount = await createAssociatedTokenAccount(
      connection,
      feePayer,
      mint,
      program.provider.wallet.publicKey
    );
    const programVault = await createAssociatedTokenAccount(
      connection,
      feePayer,
      mint,
      program.programId
    );

    console.log(ownerTokenAccount);
    console.log(programVault);

    const tx = program.rpc.initialize({});
  });
});
