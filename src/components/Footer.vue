<template>
  <div class="hW">
    <div class="foot1 hidden-xs-only" :style="{ 'min-width': width }">
      <div>Contact Us: ShibaX@ShibaInu-X.com</div>
      <div>© 2021 SHIBAX - All Rights Reserved.</div>
    </div>
    <div class="foot2 hidden-sm-and-up">
      <div>Contact Us: ShibaX@ShibaInu-X.com</div>
      <div>© 2021 SHIBAX - All Rights Reserved.</div>
    </div>
  </div>
</template>
<script>
// import LeftAside from '@/components/LeftAside.vue';

import { mapState } from 'vuex';
export default {
  name: 'Header',
  data() {
    return {
      drawer: false,
    };
  },
  created() {
    if (this.$route.name == 'reward') {
      this.width = '1920px !important';
      console.log(this.$route.name, 11111111111);
    } else {
      this.width = '100%';
    }
  },
  watch: {
    '$route.name'() {
      if (this.$route.name == 'reward') {
        this.width = '1920px !important';
        console.log(this.$route.name, 11111111111);
      } else {
        this.width = '100%';
        console.log();
      }
    },
  },
  components: {
    // LeftAside,
  },
  computed: {
    ...mapState(['account']),
    getAccount() {
      if (this.account) {
        return this.account.substring(0, 6) + '...' + this.account.substring(this.account.length - 12, this.account.length);
      } else {
        return '';
      }
    },
    getAccount1() {
      if (this.account) {
        return this.account.substring(0, 3) + '...' + this.account.substring(this.account.length - 3, this.account.length);
      } else {
        return '';
      }
    },
  },
  mounted() {},
  methods: {
    handleWi() {
      window.open('/COWBOYFARM.pdf');
    },
    handleHome1() {
      this.drawer = false;
      document.getElementById('home1').scrollIntoView();
    },
    handleHome() {
      this.drawer = false;
      document.getElementById('home').scrollIntoView();
    },

    handleNft() {
      this.drawer = false;
      document.getElementById('nfts').scrollIntoView();
    },
    handleNft1() {
      this.drawer = false;
      document.getElementById('nfts1').scrollIntoView();
    },
    handleDev() {
      this.drawer = false;
      document.getElementById('dev').scrollIntoView();
    },
    handleDev1() {
      this.drawer = false;
      document.getElementById('dev1').scrollIntoView();
    },
    handleEc() {
      this.drawer = false;
      document.getElementById('ec').scrollIntoView();
    },
    handleEc1() {
      this.drawer = false;
      document.getElementById('ec1').scrollIntoView();
    },
    handleClose() {},
    handleLogin() {
      this.$store.dispatch('setWallet');
    },
    changeLaguages() {
      let lang = this.$i18n.locale === 'zh' ? 'en' : 'zh';
      this.$i18n.locale = lang;
    },
    handleRouter() {
      window.open('https://app.sushi.com/swap?outputCurrency=0xc2118d4d90b274016cB7a54c03EF52E6c537D957');
    },
  },
};
</script>

<style lang="less" scoped>
.hW {
  // position: fixed;
  // z-index: 999;
  // min-width: 1920px;
  width: 100%;
  // width: 4000px;
}
.foot1 {
  width: 100%;
  height: 40px;
  background: #000;
  color: #fff;
  align-items: center;
  display: flex;
  justify-content: center;
  > div {
    font-size: 17px;
    font-family: Arial;
    font-weight: 400;
    color: #ffffff;
    line-height: 18px;
    margin: 0 20px;
  }
}
.foot2 {
  text-align: center;
  height: 25px;
  background: #000;
  font-size: 11px;
  font-family: Arial;
  font-weight: 400;
  color: #ffffff;
  line-height: 13px;
}
</style>
