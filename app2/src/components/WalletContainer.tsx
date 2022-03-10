import React, { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as anchor from '@project-serum/anchor';

import { preflightCommitment, programID, getNft } from '../utils/index';
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    // Transaction,
    Keypair,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getMint, getAccount } from '@solana/spl-token';
import { Program, Provider } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import axios from 'axios';

import TokenContainer from './TokenContainer';
import StakedTokenContainer from './StakedTokenContainer';

import idl from '../idl.json';
import * as styles from '../styles/index';

// import * as bs58 from 'bs58';

import {
    initialize,
    stake,
    unstake,
    collectTokenRewards,
    stakeMultipleTokens,
    unstakeMultipleTokens,
} from '../utils/staking';

// import { useWalletNfts } from '@nfteyez/sol-rayz-react';
// import type { Options } from '@nfteyez/sol-rayz';
// @ts-ignore

// const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
//   'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
// );
// let tokens = null;
// const tokenArray = [
//     // stuck token
//     // new PublicKey('4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'),
//     new PublicKey('mpPGBiedL26AMGz58EKaLR1X692eVD6QoXwxXm6LWjX'),
//     new PublicKey('2snK4sppZMRpLMvnGxPiXxCvmbdhtaVCHkPTxZmCq7AZ'),
//     new PublicKey('AzNjw6AtwrEd36Ec42Cn5GosDe7CHJwfeuoZpx7Mz1Nm'),
// ];
// const tokenAccountsArray = [];

const MyWallet: React.FC = () => {
    const [nftData, setNftData] = useState<any[]>([]);
    // const [nftDisplay, setNftDisplay] = useState<any[]>([]);
    const [tokens, setTokens] = useState<any[]>([]);
    const [tokenAccountsArray, setTokenAccountsArray] = useState<any[]>([]);
    const [stakingTokens, setStakingTokens] = useState([]);
    const [unstakingTokens, setUnstakingTokens] = useState([]);
    const [stakedTokens, setStakedTokens] = useState([]);
    const [stakedTokenAccountsArray, setStakedTokenAccountsArray] = useState([]);

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

    useEffect(() => {
        console.log(program.provider.wallet);
    }, [program.provider.wallet]);

    useEffect(() => {
        console.log('finding token account');
        // @ts-ignore
        const results = [];
        // @ts-ignore
        const findTokenAccounts = async () => {
            for (const token of stakingTokens) {
                const pubkey = new PublicKey(token);
                console.log(pubkey);
                const ATA = (
                    await provider.connection.getParsedTokenAccountsByOwner(
                        program.provider.wallet.publicKey as PublicKey,
                        {
                            mint: pubkey as PublicKey,
                        }
                    )
                ).value;
                results.push(ATA[0]);
            }
            // @ts-ignore
            setTokenAccountsArray(results);
        };
        findTokenAccounts();
        // @ts-ignore
    }, [stakingTokens]);

    const retrieveTokens = async () => {
        // TODO: add filter for user
        const mints: [] = [];
        let userNfts: [] = [];
        const response = await connection.getParsedTokenAccountsByOwner(provider.wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });
        response.value.forEach((accountInfo) => {
            if (accountInfo.account.data['parsed']['info']['tokenAmount']['amount'] === '1') {
                // @ts-ignore
                mints.push(accountInfo.account.data['parsed']['info']['mint']);
            }
        });
        for (const mint of mints) {
            const mintPk = new PublicKey(mint);
            // @ts-ignore
            let tokenObj = [];
            try {
                const tokenmetaPubkey = await Metadata.getPDA(mintPk);
                const tokenmeta = await Metadata.load(connection, tokenmetaPubkey);
                if (
                    Object.keys(tokenmeta).length &&
                    tokenmeta.data.mint !== '4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'
                ) {
                    // console.log(tokenmeta);
                    // @ts-ignore
                    tokenObj = [...tokenObj, tokenmeta];
                    const val = await axios.get(tokenmeta.data.data.uri);
                    // @ts-ignore
                    tokenObj = [...tokenObj, val];
                    // console.log(tokenObj);
                    // @ts-ignore
                    userNfts = [...userNfts, tokenObj];
                }
            } catch (e) {
                // console.log(e);
            }
        }
        console.log(userNfts);
        setNftData(userNfts);
        const allStakedTokens = await program.account.escrowAccount.all();

        console.log('allStakedTokens');
        console.log(allStakedTokens);
        // @ts-ignore
        let stakedTokenList = [];
        for (const token in allStakedTokens) {
            // console.log('single staked token');
            // console.log(allStakedTokens[token]);
            if (
                allStakedTokens[token].account.mint.toString() !== 'coGMtFdR7CuV2sE7eor7w6hzTaEuEugQxu5zEqCF382' &&
                allStakedTokens[token].account.mint.toString() !== 'GTno8oV1zaL2QaR9j7uMdCcmrVrq68eA33Dux96ePaFv' &&
                allStakedTokens[token].account.initializerKey.toString() ===
                    program.provider.wallet.publicKey.toString()
            ) {
                console.log('valid staked token');
                console.log(allStakedTokens[token].account.mint.toString());

                // if (
                //     allStakedTokens[token].account.initializerKey.toString() ===
                //     program.provider.wallet.publicKey.toString()
                // ) {
                // @ts-ignore
                let stakedTokenObj = [allStakedTokens[token]];
                // if (stakedTokenObj)
                try {
                    const tokenmetaPubkey = await Metadata.getPDA(allStakedTokens[token].account.mint);
                    const tokenmeta = await Metadata.load(connection, tokenmetaPubkey);
                    console.log(tokenmeta);
                    if (
                        Object.keys(tokenmeta).length &&
                        tokenmeta.data.mint !== '4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'
                    ) {
                        const val = await axios.get(tokenmeta.data.data.uri);
                        // @ts-ignore
                        stakedTokenObj = [tokenmeta, val, ...stakedTokenObj];
                        console.log(stakedTokenObj);
                        // @ts-ignore
                        stakedTokenList = [...stakedTokenList, stakedTokenObj];
                    }
                } catch (e) {
                    // console.log(e);
                }
                // }
            }
        }
        // @ts-ignore
        console.log(stakedTokenList);
        // @ts-ignore
        setStakedTokens(stakedTokenList);
    };

    // @ts-ignore
    const collectRewards = async (token) => {
        await collectTokenRewards(provider, program, token);
        console.log('collection successful');
    };

    const stakeTokens = async () => {
        if (tokenAccountsArray.length > 0) {
            const init = await initialize(connection, TEST_MINT_PK, provider);
            console.log(init);
            await stakeMultipleTokens(provider, program, tokenAccountsArray);
            retrieveTokens();
        } else {
            alert('Please select at least one token to stake');
        }
    };

    const unstakeTokens = async () => {
        // if (tokenAccountsArray.length > 0) {
        const init = await initialize(connection, TEST_MINT_PK, provider);
        console.log(init);

        await unstakeMultipleTokens(provider, program, unstakingTokens);
        retrieveTokens();
    };

    const mintValue = (val: string) => {
        console.log(val);
        let tokenKeys = stakingTokens;
        // @ts-ignore
        if (stakingTokens.includes(val)) {
            tokenKeys = tokenKeys.filter((key) => key !== val);
            // @ts-ignore
        } else if (!stakingTokens.includes(val)) {
            // @ts-ignore
            tokenKeys = [...tokenKeys, val];
        }
        setStakingTokens(tokenKeys);
    };

    const selectUnstake = (val: []) => {
        console.log(val);
        let tokenKeys = unstakingTokens;
        // @ts-ignore
        if (unstakingTokens.includes(val)) {
            tokenKeys = tokenKeys.filter((key) => key !== val);
            // @ts-ignore
        } else if (!unstakingTokens.includes(val)) {
            // @ts-ignore
            tokenKeys = [...tokenKeys, val];
        }
        console.log(tokenKeys);
        setUnstakingTokens(tokenKeys);
    };

    return (
        <>
            <div className="multi-wrapper">
                <div className="button-wrapper">
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
                                        {stakingTokens.length > 0 && (
                                            <div style={{ margin: '10px 0' }}>
                                                <button style={styles.btnStyle} onClick={stakeTokens}>
                                                    Stake Tokens
                                                </button>
                                            </div>
                                        )}
                                        {unstakingTokens.length > 0 && (
                                            <div style={{ margin: '10px 0' }}>
                                                <button style={styles.btnStyle} onClick={unstakeTokens}>
                                                    Unstake Tokens
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {nftData.length > 0 && (
                                            // @ts-config
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <h2>Available Tokens</h2>
                                                <TokenContainer
                                                    selectedTokens={stakingTokens}
                                                    callback={mintValue}
                                                    tokens={nftData}
                                                />
                                            </div>
                                        )}
                                        {stakedTokens.length > 0 && (
                                            // @ts-config
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <h2>Staked Tokens</h2>
                                                <StakedTokenContainer
                                                    selectedTokens={unstakingTokens}
                                                    callback={selectUnstake}
                                                    tokens={stakedTokens}
                                                    rewards={collectRewards}
                                                />
                                            </div>
                                        )}
                                    </div>
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
