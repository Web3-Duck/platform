<template>
  <div class="header">
    <div class="" style="flex: 1">
      <img src="@/assets/img/logo.png" alt="" class="logo" />
    </div>

    <div class="navWrap">
      <div class="nav" @click="$router.push('/')">Trading market</div>
      <div class="nav" @click="$router.push('/advertisement')">Advertising Hall</div>
    </div>
    <div class="rightItem" style="flex: 1">
      <div class="addressBox" v-if="account">
        <div class="account">My account {{ account }}</div>
      </div>
      <el-button type="primary" class="loginBtn" v-else @click="handleLogin">Connect Wallet</el-button>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'Header',

  data() {
    return {};
  },
  computed: {
    ...mapState(['account']),
    getAccount() {
      if (this.account) {
        return this.account.substring(0, 8) + '...' + this.account.substring(this.account.length - 8, this.account.length);
      } else {
        return '';
      }
    },
  },
  created() {},
  mounted() {},
  methods: {
    handleLogin() {
      this.$store.dispatch('setWallet');
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 50px;
  box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  .navWrap {
    display: flex;
    align-items: center;
    font-size: 24px;
  }
  .nav {
    margin-right: 20px;
    cursor: pointer;
  }
  .rightItem {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .loginBtn {
      height: 35px;
    }
  }
  .addressBox {
    max-width: 250px;
    line-height: 20px;
    font-size: 20px;
    // padding: 5px;
    display: flex;
    align-items: center;
  }
  .walletBox {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: -12px;
    z-index: 10;
    .wallet {
      height: 30px;
      width: 30px;
    }
  }
  .account {
    font-family: Kanit, sans-serif;
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: rgb(239, 244, 245);
    padding: 0 5px 0 10px;
    line-height: 28px;
    color: #333;
    border-radius: 0 10px 10px 0;
  }
}
.logo {
  height: 40px;
}
</style>
