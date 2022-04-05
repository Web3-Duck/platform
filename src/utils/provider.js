import Web3 from 'web3';
import getRpcUrl from '@/utils/getRpcUrl';

const RPC_URL = getRpcUrl();

export const simpleRpcProvider = new Web3(new Web3.providers.HttpProvider(RPC_URL));

export default null;
