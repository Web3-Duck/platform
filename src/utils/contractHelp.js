import { simpleRpcProvider } from '@/utils/provider';

import marketAbi from '@/config/abi/market.json';

import { getMarketAddress } from '@/utils/addressHelp';

const getContract = (abi, address, provider) => {
  let signerOrProvider = provider != undefined ? provider : simpleRpcProvider;
  return new signerOrProvider.eth.Contract(abi, address);
};

export const getMarketContract = provider => {
  return getContract(marketAbi, getMarketAddress(), provider);
};
