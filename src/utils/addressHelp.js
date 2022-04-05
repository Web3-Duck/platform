import addresses from '@/config/constants/contracts.js';

export const getAddress = address => {
  return address;
};

export const getMarketAddress = () => {
  return getAddress(addresses.market);
};
