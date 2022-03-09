import { PublicKey, Keypair } from '@solana/web3.js';
import 'dotenv';

const seed = process.env.PRIMARY_SEED.split(', ').slice(0, 32);
const payerSeed = process.env.PAYER_SEED.split(', ').slice(0, 32);
const escrowWalletSeed = process.env.ESCROW_SEED.split(', ').slice(0, 32);
const escrowWallet2Seed = process.env.ESCROW_SEED_2.split(', ').slice(0, 32);
const rewardWalletSeed = process.env.REWARD_WALLET_SEED.split(', ').slice(
  0,
  32
);

const seedInt = [];
const payerSeedInt = [];
const escrowWalletSeedInt = [];
const escrowWallet2SeedInt = [];
const rewardWalletSeedInt = [];

seed.forEach((item) => {
  seedInt.push(parseInt(item));
});
payerSeed.forEach((item) => {
  payerSeedInt.push(parseInt(item));
});
escrowWalletSeed.forEach((item) => {
  escrowWalletSeedInt.push(parseInt(item));
});
escrowWallet2Seed.forEach((item) => {
  escrowWallet2SeedInt.push(parseInt(item));
});

rewardWalletSeed.forEach((item) => {
  rewardWalletSeedInt.push(item);
});

export const payerKeypair = Keypair.fromSeed(Uint8Array.from(payerSeedInt));
export const ownerWalletKeypair = Keypair.fromSeed(Uint8Array.from(seedInt));
export const escrowWalletKeypair = Keypair.fromSeed(
  Uint8Array.from(escrowWalletSeedInt)
);
export const escrowWallet2Keypair = Keypair.fromSeed(
  Uint8Array.from(escrowWallet2SeedInt)
);

export const rewardMintAuthorityKeypair = Keypair.fromSeed(
  Uint8Array.from(rewardWalletSeedInt)
);
