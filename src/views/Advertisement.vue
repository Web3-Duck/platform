<template>
  <div class="home">
    <h1 class="title">广告大厅</h1>
    <el-button type="primary" @click="createAdvertisementVisible = true">发布广告</el-button>
    <div class="inputWrap">
      <el-input style="width: 200px" v-model="inputAddress" placeholder="搜索地址"></el-input>
      <el-button type="primary" @click="handleAddressSearch">搜索地址</el-button>
    </div>
    <div class="menuWrap">
      <div v-for="(item, index) in menuList" :key="index" class="menuItem" @click="menuIndex = index" :class="index == menuIndex && 'active'">
        <div>{{ item.name }}</div>
      </div>
    </div>

    <div class="list">
      <div class="topInfo" v-for="(item, index) in getMarketList" :key="index">
        <div>
          <img :src="item.imgUrl" alt="" class="advertisementImg" />
          <div>发布者地址: {{ item.publisher }} <span class="userInfo" @click="handleQueryUser(item.publisher)">查看用户信息</span></div>
          <div>广告id: {{ item.id }}</div>
          <div>广告发布时间: {{ new Date(item.time * 1000).toLocaleString() }}</div>
          <div>广告描述: {{ item.describe }}</div>
          <div>广告状态: {{ item.status == 0 ? '已关闭' : item.status == 1 ? '审核中' : '已上架' }}</div>
        </div>

        <div>
          <el-button type="primary" @click="handleAuditAdvertisement(item)" v-if="item.status == 1 && operator">上架此广告</el-button>
          <el-button type="danger" @click="handleCloseAdvertisement(item)" v-if="(item.status == 1 || item.status == 2) && (item.publisher == account || operator)">关闭广告</el-button>
        </div>
      </div>
    </div>

    <el-dialog title="发布广告" :visible.sync="createAdvertisementVisible" width="500px">
      <el-form :model="form">
        <el-form-item label="发布者地址">
          <el-input v-model="account" disabled></el-input>
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="form.imgUrl"></el-input>
        </el-form-item>
        <el-form-item label="广告描述">
          <el-input v-model="form.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleNewAdvertisement">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="查看用户信息" :visible.sync="queryUserVisible" width="500px">
      <div>地址: {{ queryForm.address }}</div>
      <div>学号: {{ queryForm.uid }}</div>
      <div>姓名: {{ queryForm.name }}</div>
      <div>角色: {{ queryForm.role }}</div>
      <div>电话: {{ queryForm.telephone }}</div>
      <div>性别: {{ queryForm.sex }}</div>
      <div>邮箱: {{ queryForm.email }}</div>
      <div>偏好交易方式: {{ queryForm.like }}</div>
      <div>个人简介: {{ queryForm.introduce }}</div>
      <div>是否白名单: {{ queryForm.whiteList ? '是' : '不是' }}</div>
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
          name: '已上架',
          key: 0,
        },
        {
          name: '审核中',
          key: 1,
        },
        {
          name: '已下架广告',
          key: 2,
        },

        {
          name: '我的广告',
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
        this.$message.success('上架成功');
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
        this.$message.success('发布成功');
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
        this.$message.success('关闭成功');
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
      color: #fff;
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
    color: #fff;
    .userInfo {
      cursor: pointer;
      color: blue;
    }
    .advertisementImg {
      height: 200px;
      width: 200px;
      margin: 0 auto;
      display: inline-block;
    }
    &:nth-child(3n) {
      margin-right: 0;
    }
  }
}
</style>
