import Web3 from 'web3';

const RPC_URL = () => {
  // return 'http://localhost:8545';
  return 'https://eth-rinkeby.alchemyapi.io/v2/1sghkDK1jKFZB7LeCdBr52HI1BHO_A6l';
};

export const simpleRpcProvider = new Web3(new Web3.providers.HttpProvider(RPC_URL()));

export default null;
