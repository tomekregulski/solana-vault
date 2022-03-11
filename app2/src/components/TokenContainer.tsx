import React from 'react';
// @ts-ignore
const TokenContainer = ({ tokens, selectedToken, callback }) => {
    // @ts-ignore
    const handleClick = (val) => {
        const action = 'stake';
        // @ts-ignore
        callback(val, action);
    };

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
                                <div
                                    // @ts-ignore
                                    onClick={() => handleClick(token[0].data.mint)}
                                    key={index}
                                    // @ts-ignore
                                    style={
                                        // @ts-ignore
                                        Object.keys(selectedToken).length > 0 &&
                                        selectedToken.account.data.parsed.info.mint === token[0].data.mint
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
            ) : (
                <span>No Valid Tokens To Stake</span>
            )}
        </div>
    );
};

export default TokenContainer;
