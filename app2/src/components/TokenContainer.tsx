import React from 'react';
// @ts-ignore
const TokenContainer = ({ tokens, selectedTokens, callback }) => {
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
                                <div
                                    // @ts-ignore
                                    value={token[0].data.mint}
                                    // @ts-ignore
                                    onClick={() => handleClick(token[0].data.mint)}
                                    key={index}
                                    // @ts-ignore
                                    style={
                                        // @ts-ignore
                                        selectedTokens.includes(token[0].data.mint)
                                            ? { border: 'solid 1px blue' }
                                            : null
                                    }
                                >
                                    <img
                                        style={{ width: '100px', margin: '5px' }}
                                        src={token[1].data.image}
                                        alt="loading..."
                                        // @ts-ignore
                                    />
                                </div>
                            );
                        })
                    }
                </div>
            )}
        </div>
    );
};

export default TokenContainer;
