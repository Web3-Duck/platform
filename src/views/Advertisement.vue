<template>
  <div class="home">
    <h1 class="title">Advertising Hall</h1>
    <el-button type="primary" @click="createAdvertisementVisible = true">Advertise</el-button>
    <div class="inputWrap">
      <el-input style="width: 200px" v-model="inputAddress" placeholder="Search address"></el-input>
      <el-button type="primary" @click="handleAddressSearch">Search address</el-button>
    </div>
    <div class="menuWrap">
      <div v-for="(item, index) in menuList" :key="index" class="menuItem" @click="menuIndex = index" :class="index == menuIndex && 'active'">
        <div>{{ item.name }}</div>
      </div>
    </div>

    <div class="list">
      <div class="topInfo" v-for="(item, index) in getMarketList" :key="index">
        <div>
          <img :src="item.imgUrl" :onerror="defaultImg" alt="" class="advertisementImg" />
          <div class="userInfo" @click="handleAdDetail(item)">View order details</div>
          <div>Publisher address: {{ item.publisher }} <span class="userInfo" @click="handleQueryUser(item.publisher)">View user information</span></div>
          <div>Advertisement id: {{ item.id }}</div>
          <div>Publish time: {{ new Date(item.time * 1000).toLocaleString() }}</div>
          <div class="desibl">Describe: {{ item.describe }}</div>
          <div>Status: {{ item.status == 0 ? 'Closed' : item.status == 1 ? 'Under review' : 'On the shelf' }}</div>
        </div>

        <div>
          <el-button type="primary" @click="handleAuditAdvertisement(item)" v-if="item.status == 1 && operator">Approved</el-button>
          <el-button type="danger" @click="handleCloseAdvertisement(item)" v-if="(item.status == 1 || item.status == 2) && (item.publisher == account || operator)">Close advertisement </el-button>
        </div>
      </div>
    </div>

    <el-dialog title="Publish Advertisement" :visible.sync="createAdvertisementVisible" width="500px">
      <el-form :model="form">
        <el-form-item label="Publisher address">
          <el-input v-model="account" disabled></el-input>
        </el-form-item>
        <el-form-item label="Image Url">
          <el-input v-model="form.imgUrl"></el-input>
        </el-form-item>
        <el-form-item label="Describe">
          <el-input v-model="form.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleNewAdvertisement">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog title="View user information" :visible.sync="queryUserVisible" width="500px">
      <div>Address: {{ queryForm.address }}</div>
      <div>User Id: {{ queryForm.uid }}</div>
      <div>Name: {{ queryForm.name }}</div>
      <div>Role: {{ queryForm.role }}</div>
      <div>Telephone: {{ queryForm.telephone }}</div>
      <div>Sex: {{ queryForm.sex }}</div>
      <div>Email: {{ queryForm.email }}</div>
      <div>Preferred trading method: {{ queryForm.like }}</div>
      <div>Introduce: {{ queryForm.introduce }}</div>
      <div>Is whiteList: {{ queryForm.whiteList ? 'YES' : 'NO' }}</div>
    </el-dialog>
    <el-dialog title="View advertising details" :visible.sync="adDetailVisible" width="500px">
      <img :src="adDetail.imgUrl" :onerror="defaultImg" alt="" class="advertisementImg" />
      <div>Publisher address: {{ adDetail.publisher }}</div>
      <div>Advertisement id: {{ adDetail.id }}</div>
      <div>Publish time: {{ new Date(adDetail.time * 1000).toLocaleString() }}</div>
      <div>Describe: {{ adDetail.describe }}</div>
      <div>Status: {{ adDetail.status == 0 ? 'Closed' : adDetail.status == 1 ? 'Under review' : 'On the shelf' }}</div>
    </el-dialog>
  </div>
</template>
<script>
import { getMarketContract } from '@/utils/contractHelp';
import { mapState } from 'vuex';
import { formatAmount, toFixed, accDiv, accMul, accAdd, accSub, parseAmount, gasProcessing } from '@/utils/format';
export default {
  name: 'Advertisement',
  components: {},
  computed: {
    ...mapState([
      'account',
      'provider',
      // ...
    ]),

    getMarketList() {
      if (this.menuIndex == 0) {
        return this.marketList.filter(item => {
          return item.status == 2;
        });
      }

      if (this.menuIndex == 1) {
        return this.marketList.filter(item => {
          return item.status == 1 && (item.publisher == this.account || this.operator);
        });
      }
      if (this.menuIndex == 2) {
        return this.marketList.filter(item => {
          return item.status == 0 && (item.publisher == this.account || this.operator);
        });
      }
      if (this.menuIndex == 3) {
        return this.marketList.filter(item => {
          return item.publisher == this.account;
        });
      }
      return [];
    },
  },

  data() {
    return {
      form: {
        imgUrl: '',
        describe: '',
      },

      inputAddress: '',
      createAdvertisementVisible: false, //发布广告弹窗
      marketList: [],
      menuList: [
        {
          name: 'On the shelf',
          key: 0,
        },
        {
          name: 'Under review',
          key: 1,
        },
        {
          name: 'Removed from the shelf',
          key: 2,
        },

        {
          name: 'My advertisement',
          key: 3,
        },
      ],
      menuIndex: 0,
      whiteList: false, //是否为白名单
      operator: false, //是否为操作员
      queryForm: {
        address: '',
        uid: '',
        whiteList: false,
        name: '',
        telephone: '',
        role: '',
        sex: '',
        email: '',
        like: '',
        introduce: '',
      },
      queryUserVisible: false,
      defaultImg: 'this.src="' + require('../assets/img/error.png') + '"',
      adDetailVisible: false,
      adDetail: {},
    };
  },
  async created() {
    this.getOperator();
    this.getWhiteList();
    this.getMarket();
  },
  beforeDestroy() {},
  mounted() {},
  watch: {
    account() {
      this.getOperator();
      this.getWhiteList();
    },
  },
  methods: {
    handleAdDetail(item) {
      this.adDetailVisible = true;
      this.adDetail = item;
    },
    async handleQueryUser(address) {
      const marketContract = getMarketContract();
      const user = await marketContract.methods.users(address).call();
      this.queryUserVisible = true;
      this.queryForm = { ...user, address: address };
    },
    // 上架广告
    async handleAuditAdvertisement(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.auditAdvertisement(item.id, 2).estimateGas({ from: this.account });
        await marketContract.methods.auditAdvertisement(item.id, 2).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('Operate successfully');
        this.getMarket();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    },
    handleCancel() {
      this.createAdvertisementVisible = false;
      this.form = {
        amount: '',
        imgUrl: '',
        describe: '',
      };
    },
    async getWhiteList() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      const user = await marketContract.methods.users(this.account).call();
      this.whiteList = user.whiteList;
    },
    async getOperator() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      this.operator = await marketContract.methods.operator(this.account).call();
    },
    async handleAddressSearch() {
      if (this.inputAddress == '') {
        this.getMarket();
        return;
      }
      this.marketList = this.marketList.filter(item => {
        return item.publisher.toLowerCase().includes(this.inputAddress.toLowerCase());
      });
    },
    // https://portrait.gitee.com/uploads/avatars/user/20/61279_fuhai_1578915942.png
    // https://portrait.gitee.com/uploads/avatars/user/145/435806_jamen_1578923801.png
    async getMarket() {
      const marketContract = getMarketContract();
      const length = await marketContract.methods.advertisementLength().call();
      const p = [];
      for (let i = 0; i < length; i++) {
        p.push(marketContract.methods.advertisements(i).call());
      }
      this.marketList = await Promise.all(p);
    },
    async handleNewAdvertisement() {
      const marketContract = getMarketContract(this.provider);
      const { imgUrl, describe } = this.form;
      try {
        const fee = parseAmount('0.1');
        const gas = await marketContract.methods.newAdvertisement(imgUrl, describe).estimateGas({ from: this.account, value: fee });
        await marketContract.methods.newAdvertisement(imgUrl, describe).send({ from: this.account, gas: gasProcessing(gas), value: fee });
        this.$message.success('Publish successfully');
        this.createAdvertisementVisible = false;
        this.form = {
          amount: '',
          imgUrl: '',
          describe: '',
        };
        this.getMarket();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    },

    // 下架关闭广告
    async handleCloseAdvertisement(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.closeAdvertisement(item.id).estimateGas({ from: this.account });
        await marketContract.methods.closeAdvertisement(item.id).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('Close successfully ');
        this.getMarket();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    },

    toFixed,
    accMul,
    formatAmount,
  },
};
</script>

<style lang="less" scoped>
.home {
  width: 1090px;
  margin: 0 auto;
  color: #333;
  font-size: 13px;
  .logo {
    width: 150px;
  }
  .title {
    margin-top: 20px;
  }
  .menuWrap {
    margin-top: 10px;
    display: flex;
    align-items: center;
    .menuItem {
      cursor: pointer;
      border: 1px solid rgb(17, 131, 238);
      margin-right: 10px;
      padding: 5px 10px;
      border-radius: 5px;
    }
    .active {
      background: rgb(17, 131, 238);
      color: #333;
    }
  }
  .inputWrap {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
  }
  .topInfo {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    line-height: 30px;
    width: 350px;
    border: 2px solid #999;
    border-radius: 5px;
    padding: 10px;
    margin: 20px 20px 0 0;
    color: #333;
    .desibl {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; //控制行数
      overflow: hidden;
      text-overflow: ellipsis; /*显示省略号来代表被修剪的文本*/
    }
    .userInfo {
      cursor: pointer;
      color: blue;
    }

    &:nth-child(3n) {
      margin-right: 0;
    }
  }
  .advertisementImg {
    height: 200px;
    width: 200px;
    display: inline-block;
  }
}
</style>
