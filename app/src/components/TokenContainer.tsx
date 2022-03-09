// @ts-ignore
const TokenContainer = (props) => {
  const { tokens } = props;

  // @ts-ignore
  const handleClick = (val) => {
    props.callback(val);
  };

  return (
    <div
      style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '3px solid fuchsia',
        borderRadius: '10px',
        padding: '100px',
        marginLeft: '40px',
      }}
    >
      {tokens && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {
            // @ts-ignore
            tokens.map((token, index) => {
              return (
                <div
                  // @ts-ignore
                  value={token.data.mint}
                  // @ts-ignore
                  onClick={() => handleClick(token.data.mint)}
                  key={index}
                >
                  <img
                    style={{ width: '100px' }}
                    src={token.data.image}
                    alt='loading...'
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
