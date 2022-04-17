import Web3 from 'web3';

const RPC_URL = () => {
  return 'http://localhost:8545';
  //   return 'https://rinkeby.infura.io/v3/13ab66893f804b6684194366db26efc3';
};

export const simpleRpcProvider = new Web3(new Web3.providers.HttpProvider(RPC_URL()));

export default null;
