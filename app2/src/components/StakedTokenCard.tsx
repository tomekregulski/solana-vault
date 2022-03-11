import React, { useState, useEffect } from 'react';
import * as styles from '../styles/index';

// @ts-ignore
const StakedTokenCard = ({ rewards, token, selectedToken, callback }) => {
    const [selected, setSelected] = useState(false);
    // @ts-ignore
    const handleClick = (val) => {
        // @ts-ignore
        callback(val, 'unstake');
    };

    useEffect(() => {
        if (Object.keys(selectedToken).length > 0) {
            if (token[2].account.mint.toString() === selectedToken.account.mint.toString()) {
                setSelected(true);
            } else {
                setSelected(false);
            }
        } else if (Object.keys(selectedToken).length === 0) {
            setSelected(false);
        }
    }, [selectedToken, token]);

    // @ts-ignore
    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const year = date.getDate();
        const month = date.getMonth();
        const day = date.getFullYear();
        const hours = date.getHours();
        const minutes = '0' + date.getMinutes();
        const seconds = '0' + date.getSeconds();

        const formattedTime = `${day}/${month}/${year} - ${hours}:${minutes.substr(-2)}`;

        return formattedTime;
    };

    // @ts-ignore
    const timeSinceStake = (token) => {
        const created = token[2].account.created.toString();
        const now = new Date().getTime() / 1000;

        // @ts-ignore
        const difference = now - created;
        const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
        return daysDifference;
    };

    // @ts-ignore
    const timeSinceCollected = (token) => {
        const collected = token[2].account.lastRewardCollection.toString();
        const now = new Date().getTime() / 1000;

        // @ts-ignore
        const difference = now - collected;
        const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
        return daysDifference;
    };

    return (
        <div // @ts-ignore
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '3px solid fuchsia',
                borderRadius: '10px',
                padding: '10px',
            }}
        >
            <div
                // @ts-ignore
                value={token[0].data.mint}
                onClick={() => handleClick(token[2])}
                // @ts-ignore
                style={
                    // @ts-ignore
                    selected ? { border: 'solid 3px blue' } : null
                }
            >
                <img
                    style={{ display: 'block', width: '100px', margin: '5px' }}
                    src={token[1].data.image}
                    alt="loading..."
                    // @ts-ignore
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <span>Rewards:</span>
                <span>{token[2].account.totalRewardCollected.words[0]}</span>
                <span>Last Collected on:</span>
                <span>
                    {formatTime(token[2].account.lastRewardCollection.toString()) ===
                    formatTime(token[2].account.created.toString())
                        ? '--'
                        : formatTime(token[2].account.lastRewardCollection.toString())}
                </span>
                <span>Time Since Last Collected:</span>
                {/* <span>{timestampDifference(token, 'collected')}</span> */}
                <span>Staked On:</span>
                <span>{formatTime(token[2].account.created.toString())}</span>
                <span>Total Time Staked:</span>
                <span>{timeSinceStake(token)}</span>
            </div>
            <button
                style={{
                    background: 'none',
                    color: 'white',
                    border: '2px solid fuchsia',
                    borderRadius: '30px',
                    padding: '5px',
                    width: '100px',
                    margin: '10px 10px',
                }}
                onClick={() => rewards(token)}
            >
                Collect
            </button>
        </div>
    );
};

export default StakedTokenCard;
