// if (process.env.NODE_ENV !== 'production' && (!process.env.REACT_APP_NODE_1 || !process.env.REACT_APP_NODE_2 || !process.env.REACT_APP_NODE_3)) {
//   throw Error('One base RPC URL is undefined');
// }

// // Array of available nodes to connect to
// export const nodes = [process.env.REACT_APP_NODE_1, process.env.REACT_APP_NODE_2, process.env.REACT_APP_NODE_3];

const getNodeUrl = () => {
  // Use custom node if available (both for development and production)
  // However on the testnet it wouldn't work, so if on testnet - comment out the REACT_APP_NODE_PRODUCTION from env file
  //   if (process.env.APP_NODE) {
  //     return process.env.APP_NODE;
  //   }
  //   return sample(nodes);
  // https://bsc-dataseed.binance.org/
  // return 'http://localhost:8545';
  return 'https://rinkeby.infura.io/v3/13ab66893f804b6684194366db26efc3';
};

export default getNodeUrl;
