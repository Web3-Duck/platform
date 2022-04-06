<template>
  <div class="home">
    <h1 class="title">管理员界面</h1>
    <div class="inputWrap">
      <el-input style="width: 200px; margin-right: 10px" v-model="inputAddress" placeholder="输入地址"></el-input>
      <el-button type="primary" @click="handleQueryWhiteList">查询是否为白名单</el-button>
      <el-button type="primary" @click="handleQueryOperator">查询是否为操作者</el-button>
    </div>
    <div style="margin-top: 10px">
      <el-button type="primary" @click="handleOperator(true)" v-if="owner">设置为操作者</el-button>
      <el-button type="danger" @click="handleOperator(false)" v-if="owner">取消操作者</el-button>
      <el-button type="primary" @click="handleWhiteList(true)" v-if="operator">设置为白名单</el-button>
      <el-button type="danger" @click="handleWhiteList(false)" v-if="operator">取消白名单</el-button>
    </div>
  </div>
</template>
<script>
import { getMarketContract } from '@/utils/contractHelp';
import { mapState } from 'vuex';
import { formatAmount, toFixed, accDiv, accMul, accAdd, accSub, parseAmount, gasProcessing } from '@/utils/format';
export default {
  name: 'Admin',
  components: {},
  computed: {
    ...mapState([
      'account',
      'provider',
      // ...
    ]),
  },

  data() {
    return {
      owner: false, //是否管理员
      whiteList: false, //是否为白名单
      operator: false, //是否为操作员
      inputAddress: '',
    };
  },
  async created() {
    this.getOperator();
    this.getWhiteList();
    this.getOwner();
  },
  beforeDestroy() {},
  mounted() {},
  watch: {
    account() {
      this.getOperator();
      this.getWhiteList();
      this.getOwner();
    },
  },
  methods: {
    async handleQueryOperator() {
      const marketContract = getMarketContract();
      const whiteList = await marketContract.methods.operator(this.inputAddress).call();
      const message = whiteList ? '该账户是操作员' : '该账户不是操作员';
      this.$message.success(message);
    },
    async handleQueryWhiteList() {
      const marketContract = getMarketContract();
      const whiteList = await marketContract.methods.whiteList(this.inputAddress).call();
      const message = whiteList ? '该账户是白名单' : '该账户不是白名单';
      this.$message.success(message);
    },
    // 设置操作员
    async handleOperator(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setOperator(this.inputAddress, status).estimateGas({ from: this.account });
        await marketContract.methods.setOperator(this.inputAddress, status).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('设置成功');
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        this.$message.error(e + '');
      }
    }, // 设置白名单
    async handleWhiteList(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setWhiteList(this.inputAddress, status).estimateGas({ from: this.account });
        await marketContract.methods.setWhiteList(this.inputAddress, status).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('设置成功');
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        this.$message.error(e + '');
      }
    },
    async getWhiteList() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      this.whiteList = await marketContract.methods.whiteList(this.account).call();
    },
    async getOperator() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      this.operator = await marketContract.methods.operator(this.account).call();
    },
    async getOwner() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      const owner = await marketContract.methods.owner().call();
      console.log(owner, this.account, owner == this.account, 'owner == this.account');
      this.owner = owner == this.account;
    },
  },
};
</script>

<style lang="less" scoped>
.home {
  width: 1090px;
  margin: 0 auto;
  color: #333;
  font-size: 12px;
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
      badvertisement: 1px solid rgb(17, 131, 238);
      margin-right: 10px;
      padding: 5px 10px;
      badvertisement-radius: 5px;
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
    border: 1px solid #999;
    padding: 10px;
    margin: 20px 20px 0 0;
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
