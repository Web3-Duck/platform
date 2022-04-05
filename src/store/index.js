import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';

//模块化store
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    provider: {},
    account: '',
    net: 0,
    loading: true,
  },
  mutations: {
    SETPROVIDER: (state, provider) => {
      state.provider = provider;
    },
    SETACCOUNTS: (state, account) => {
      state.account = account;
    },
    SETNET: (state, net) => {
      state.net = net;
    },
    SETLOADING: (state, loading) => {
      state.loading = loading;
    },
  },
  actions: {
    async setWallet() {
      var web3Provider;
      if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
          await web3Provider.enable();
        } catch (e) {
          console.log(e);
        }
      }
    },
    async setWebProvider({ commit }) {
      var web3Provider;
      if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
          // await web3Provider.request({
          //   method: 'wallet_addEthereumChain',
          //   params: [
          //     {
          //       chainId: '0x38',
          //       chainName: 'Binance Smart Chain Mainnet',
          //       nativeCurrency: {
          //         name: 'BNB',
          //         symbol: 'bnb',
          //         decimals: 18,
          //       },
          //       rpcUrls: ['https://bsc-dataseed.binance.org/'],
          //       blockExplorerUrls: [`https://bscscan.com/`],
          //     },
          //   ],
          // });
          await window.ethereum.enable();
        } catch (error) {
          console.error('User denied account access');
        }
        const web3js = new Web3(web3Provider);
        commit('SETPROVIDER', web3js);
        web3js.eth.net.getId(function (error, result) {
          if (!error) {
            commit('SETNET', result);
          }
        });
        web3js.eth.getAccounts(function (error, result) {
          if (!error) {
            commit('SETACCOUNTS', result[0]);
          }
        });
        web3Provider.on('networkChanged', function (networkIDstring) {
          commit('SETNET', networkIDstring);
        });
        web3Provider.on('accountsChanged', function (accounts) {
          commit('SETACCOUNTS', accounts[0]);
        });
      }
    },
  },
});
