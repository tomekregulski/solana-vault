import React, { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

import { preflightCommitment, programID, getNft } from '../utils/index';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  // Transaction,
  Keypair,
} from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';

import axios from 'axios';

import TokenContainer from './TokenContainer';

import idl from '../idl.json';
import * as styles from '../styles';

import { initialize, stake, unstake } from '../utils/staking';

import { useWalletNfts } from '@nfteyez/sol-rayz-react';
import type { Options } from '@nfteyez/sol-rayz';
// @ts-ignore

// const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
//   'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
// );

const MyWallet: React.FC = () => {
  const [nftData, setNftData] = useState<any[]>([]);
  const [nftDisplay, setNftDisplay] = useState<any[]>([]);
  const [tokenMint, setTokenMint] = useState<String>('');

  const TEST_MINT = '9agr4P3EJ82iJn3vAr9YdfVmfDWgQSrSZMe3UxEDzSpY';
  const TEST_MINT_PK = new PublicKey(TEST_MINT);

  const devnet = clusterApiUrl('devnet');
  // const mainnet = clusterApiUrl('mainnet-beta');
  const network = devnet;

  const wallet = useAnchorWallet();
  const connection = new Connection(network, preflightCommitment);
  // @ts-ignore
  const provider = new Provider(connection, wallet, preflightCommitment);
  // @ts-ignore
  const program = new Program(idl, programID, provider);
  const localAccount = Keypair.generate();

  const retrieveTokens = async () => {
    // const nftsmetadata = await Metadata.findDataByOwner(
    //   connection,
    //   provider.wallet.publicKey
    // );
    // const nftsmetadata = await getNft(connection, provider.wallet.publicKey);
    setTokenMint(TEST_MINT);
  };

  const stakeToken = async () => {
    const init = await initialize(connection, TEST_MINT_PK, provider);
    console.log(init);
    stake(provider, program);
  };

  const unstakeToken = async () => {
    const init = await initialize(connection, TEST_MINT_PK, provider);
    console.log(init);
    unstake(provider, program);
  };

  const mintValue = (val: String) => {
    setTokenMint(val);
  };

  useEffect(() => {
    let arr: [] = [];
    const parseNftData = async () => {
      for (let i = 0; i < nftData.length; i++) {
        let val = await axios.get(nftData[i].data.uri);
        val.data.mint = nftData[i].mint;
        // @ts-ignore
        arr.push(val);
      }
      setNftDisplay(arr);
    };
    parseNftData();
  }, [nftData]);

  return (
    <>
      <div className='multi-wrapper'>
        <div className='button-wrapper'>
          <WalletModalProvider>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '80px',
              }}
            >
              <WalletMultiButton />
            </div>
            {wallet ? (
              <div>
                <div>
                  <div
                    style={{
                      marginTop: '30px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ margin: '10px 0' }}>
                      <button style={styles.btnStyle} onClick={retrieveTokens}>
                        {nftData.length === 0 ? 'Fetch NFTs' : 'Refresh NFts'}
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <p>Source Wallet: {wallet.publicKey.toString()}</p>
                    {nftDisplay.length > 0 && (
                      <TokenContainer
                        callback={mintValue}
                        tokens={nftDisplay}
                      />
                    )}
                  </div>
                  {wallet && tokenMint !== '' ? (
                    <div
                      style={{
                        marginTop: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <button onClick={stakeToken} style={styles.btnStyle}>
                        Stake Token
                      </button>
                      <button onClick={unstakeToken} style={styles.btnStyle}>
                        Unstake Token
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p>Connect your wallet to begin</p>
            )}
          </WalletModalProvider>
        </div>
      </div>
    </>
  );
};

export default MyWallet;
