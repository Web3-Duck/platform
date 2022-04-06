<template>
  <div id="app">
    <Header></Header>
    <h2>请使用Rinkeby网络体验</h2>
    <h2>合约已关闭白名单，操作员权，管理员权限限制，自行体验</h2>
    <h2>合约地址Rinkeby:0x4731A328DB3Eb4827575aCa1d69d881944F3d684</h2>
    <router-view />
  </div>
</template>

<script>
import Header from '@/components/Header';

export default {
  name: 'App',
  computed: {},

  created() {},
  mounted() {},

  beforeCreate() {
    this.$store.dispatch('setWebProvider');
  },

  components: {
    Header,
  },
  methods: {},
};
</script>

<style lang="less" scoped>
#app {
  font-family: Square, Roboto, Segoe UI, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  height: 100vh;
  background: url('./assets/img/bg.png');
  background-size: 100% 100%;
  overflow-y: auto;
}
</style>
