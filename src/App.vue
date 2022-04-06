<template>
  <div id="app">
    <Header></Header>
    <router-view />
  </div>
</template>

<script>
import Header from '@/components/Header';

import Footer from '@/components/Footer';

export default {
  name: 'App',
  computed: {},

  created() {},
  mounted() {},

  beforeCreate() {
    this.$store.dispatch('setWebProvider');
  },

  components: {
    Footer,
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
