import React from 'react';
import * as styles from '../styles/index';

import StakedTokenCard from './StakedTokenCard';

// @ts-ignore
const StakedTokenContainer = ({ rewards, tokens, selectedToken, callback }) => {
    return (
        <div
            style={{
                width: '600px',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '3px solid fuchsia',
                borderRadius: '10px',
                padding: '50px',
                marginLeft: '40px',
            }}
        >
            {tokens.length ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap',
                        width: '100%',
                    }}
                >
                    {
                        // @ts-ignore
                        tokens.map((token, index) => {
                            return (
                                <StakedTokenCard
                                    key={index}
                                    // @ts-ignore
                                    rewards={rewards}
                                    callback={callback}
                                    token={token}
                                    // @ts-ignore
                                    selectedToken={selectedToken}
                                />
                                // <div // @ts-ignore
                                //     key={index}
                                //     style={{
                                //         display: 'flex',
                                //         flexDirection: 'column',
                                //         justifyContent: 'center',
                                //         alignItems: 'center',
                                //     }}
                                // >
                                //     <div
                                //         // @ts-ignore
                                //         value={token[0].data.mint}
                                //         onClick={() => handleClick(token[2])}
                                //         // @ts-ignore
                                //         style={
                                //             // @ts-ignore
                                //             selectedTokens.includes(token[2]) ? { border: 'solid 1px blue' } : null
                                //         }
                                //     >
                                //         <img
                                //             style={{ width: '100px', margin: '5px' }}
                                //             src={token[1].data.image}
                                //             alt="loading..."
                                //             // @ts-ignore
                                //         />
                                //         <div
                                //             style={{
                                //                 display: 'flex',
                                //                 flexDirection: 'column',
                                //                 justifyContent: 'center',
                                //                 alignItems: 'center',
                                //             }}
                                //         >
                                //             <span>Rewards:</span>
                                //             <span>{token[2].account.totalRewardCollected.words[0]}</span>
                                //             <span>Last Collected:</span>
                                //             <span>{token[2].account.lastRewardCollection.toString()}</span>
                                //             <span>{token[2].account.created.toString()}</span>
                                //         </div>
                                //     </div>
                                //     <button
                                //         style={{
                                //             background: 'none',
                                //             color: 'white',
                                //             border: '2px solid fuchsia',
                                //             borderRadius: '30px',
                                //             padding: '5px',
                                //             width: '100px',
                                //             margin: '10px 10px',
                                //         }}
                                //         onClick={() => rewards(token)}
                                //     >
                                //         Collect
                                //     </button>
                                // </div>
                            );
                        })
                    }
                </div>
            ) : (
                <span>No Tokens Currently Staked</span>
            )}
        </div>
    );
};

export default StakedTokenContainer;
