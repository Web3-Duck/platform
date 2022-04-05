<template>
  <div class="home">
    <h1 class="title">交易市场</h1>
    <el-button type="primary" @click="createOrderVisible = true">发布商品</el-button>
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
        <img :src="item.imgUrl" alt="" class="orderImg" />
        <div>卖家: {{ item.seller }}</div>
        <div>订单id: {{ item.id }}</div>
        <div>商品价格: {{ formatAmount(item.amount) }} ETH</div>
        <div>商品描述: {{ item.describe }}</div>
        <div v-if="item.status == 2">商品评价: {{ item.evaluate }}</div>

        <el-button type="primary" @click="handleBuy(item)" v-if="item.status == 1">立即购买</el-button>
        <el-button type="danger" @click="handleCloseOrder(item)" v-if="item.status == 1 && (item.seller == account || operator)">关闭订单</el-button>
        <el-button type="primary" @click="handleEvaluateDialog(item)" v-if="item.status == 2 && item.buyer == account && item.evaluate == ''">评价此订单</el-button>
      </div>
    </div>

    <el-dialog title="发布商品" :visible.sync="createOrderVisible" width="500px">
      <el-form :model="form">
        <el-form-item label="卖家地址">
          <el-input v-model="account" disabled></el-input>
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="form.imgUrl"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="form.amount">
            <template slot="append">ETH</template>
          </el-input>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleNewOrder">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="评价订单" :visible.sync="evaluateOrderVisible" width="500px">
      <el-form :model="formEva">
        <el-form-item label="订单id">
          <el-input v-model="formEva.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品评价">
          <el-input v-model="formEva.evaluate"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleEvaluateOrder">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getJackPairContract, getErc20Contract, getUnStakeContract, getRewardContract, getMarketContract } from '@/utils/contractHelp';
import { mapState } from 'vuex';
import { formatAmount, toFixed, accDiv, accMul, accAdd, accSub, parseAmount, gasProcessing } from '@/utils/format';
export default {
  name: 'Home',
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
          return item.status == 1;
        });
      }

      if (this.menuIndex == 1) {
        return this.marketList.filter(item => {
          return item.status == 0;
        });
      }
      if (this.menuIndex == 2) {
        return this.marketList.filter(item => {
          return item.status == 2;
        });
      }
      if (this.menuIndex == 3) {
        return this.marketList.filter(item => {
          return item.seller == this.account;
        });
      }
      return [];
    },
  },

  data() {
    return {
      form: {
        amount: '',
        imgUrl: '',
        describe: '',
      },
      formEva: {
        id: '',
        evaluate: '',
      },
      inputAddress: '',
      totalSupply: 0, //bdlc总量
      singleTokenDividend: 0, //每日产出
      profit: 0,
      remainDlc: 0, //剩余DLC
      lpTokenDividendDlc: 0, //每日产出,
      lpTokenDividendU: 0, //每日产出价值2000U
      createOrderVisible: false, //发布商品弹窗
      evaluateOrderVisible: false, //评价订单弹窗
      marketList: [],
      menuList: [
        {
          name: '上架中',
          key: 0,
        },
        {
          name: '订单关闭',
          key: 1,
        },
        {
          name: '订单已完成',
          key: 2,
        },
        {
          name: '我的订单',
          key: 3,
        },
      ],
      menuIndex: 0,
      whiteList: false, //是否为白名单
      operator: false, //是否为操作员
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
    handleCancel() {
      this.createOrderVisible = false;
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
      this.whiteList = await marketContract.methods.whiteList(this.account).call();
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
        return item.seller.toLowerCase().includes(this.inputAddress.toLowerCase()) || item.buyer.toLowerCase().includes(this.inputAddress.toLowerCase());
      });
    },
    // https://portrait.gitee.com/uploads/avatars/user/20/61279_fuhai_1578915942.png
    // https://portrait.gitee.com/uploads/avatars/user/399/1199519_Singosgu_1590484030.png
    // https://portrait.gitee.com/uploads/avatars/user/145/435806_jamen_1578923801.png
    async getMarket() {
      const marketContract = getMarketContract();
      const length = await marketContract.methods.orderLength().call();
      const p = [];
      for (let i = 0; i < length; i++) {
        p.push(marketContract.methods.orders(i).call());
      }
      this.marketList = await Promise.all(p);
    },
    async handleNewOrder() {
      const marketContract = getMarketContract(this.provider);
      const { amount, imgUrl, describe } = this.form;
      try {
        const gas = await marketContract.methods.newOrder(parseAmount(amount), imgUrl, describe).estimateGas({ from: this.account });
        await marketContract.methods.newOrder(parseAmount(amount), imgUrl, describe).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('发布成功');
        this.createOrderVisible = false;
        this.form = {
          amount: '',
          imgUrl: '',
          describe: '',
        };
        this.getMarket();
      } catch (e) {
        this.$message.error(e + '');
      }
    },
    async handleBuy(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.buy(item.id).estimateGas({ from: this.account, value: item.amount });
        await marketContract.methods.buy(item.id).send({ from: this.account, gas: gasProcessing(gas), value: item.amount });
        this.$message.success('购买成功');
        this.getMarket();
      } catch (e) {
        this.$message.error(e + '');
      }
    },
    handleEvaluateDialog(item) {
      console.log(item, 'item');
      this.formEva.id = item.id;
      this.evaluateOrderVisible = true;
    },
    async handleEvaluateOrder() {
      const marketContract = getMarketContract(this.provider);
      const { id, evaluate } = this.formEva;
      try {
        const gas = await marketContract.methods.evaluateOrder(id, evaluate).estimateGas({ from: this.account });
        await marketContract.methods.evaluateOrder(id, evaluate).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('评价成功');
        this.formEva.id = {
          id: '',
          evaluate: '',
        };
        this.evaluateOrderVisible = false;
        this.getMarket();
      } catch (e) {
        this.$message.error(e + '');
      }
    },
    async handleCloseOrder(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.closeOrder(item.id).estimateGas({ from: this.account });
        await marketContract.methods.closeOrder(item.id).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('关闭成功');
        this.getMarket();
      } catch (e) {
        this.$message.error(e + '');
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
    line-height: 30px;
    width: 350px;
    border: 1px solid #999;
    padding: 10px;
    margin: 20px 20px 0 0;
    .orderImg {
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
