import React from 'react';
import * as styles from '../styles/index';

// @ts-ignore
const StakedTokenContainer = ({ rewards, tokens, selectedTokens, callback }) => {
    // @ts-ignore
    const handleClick = (val) => {
        // @ts-ignore
        callback(val);
    };

    return (
        <div
            style={{
                width: '400px',
                height: '300px',
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
            {tokens && (
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
                                <div // @ts-ignore
                                    key={index}
                                >
                                    <div
                                        // @ts-ignore
                                        value={token[0].data.mint}
                                        onClick={() => handleClick(token[2])}
                                        // @ts-ignore
                                        style={
                                            // @ts-ignore
                                            selectedTokens.includes(token[2]) ? { border: 'solid 1px blue' } : null
                                        }
                                    >
                                        <img
                                            style={{ width: '100px', margin: '5px' }}
                                            src={token[1].data.image}
                                            alt="loading..."
                                            // @ts-ignore
                                        />
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
                        })
                    }
                </div>
            )}
        </div>
    );
};

export default StakedTokenContainer;
