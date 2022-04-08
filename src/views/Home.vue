<template>
  <div class="home">
    <h1 class="title">Trading market</h1>
    <el-button type="primary" @click="createOrderVisible = true">Publish goods</el-button>
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
          <img :src="item.imgUrl" :onerror="defaultImg" alt="" class="orderImg" />
          <div class="userInfo" @click="handleOrderDetail(item)">View order details</div>
          <div>Order seller: {{ item.seller }} <span class="userInfo" @click="handleQueryUser(item.seller)">View user information</span></div>
          <div>Order id: {{ item.id }}</div>
          <div>Price: {{ formatAmount(item.amount) }} ETH</div>
          <div class="desibl">Describe: {{ item.describe }}</div>
          <div>Status: {{ item.status == 0 ? 'Closed' : item.status == 1 ? 'On the shelf' : 'Completed' }}</div>
          <div class="desibl" v-if="item.status == 2">Evaluation: {{ item.evaluate }}</div>
        </div>

        <div>
          <el-button type="primary" @click="handleBuy(item)" v-if="item.status == 1">Buy now</el-button>
          <el-button type="danger" @click="handleCloseOrder(item)" v-if="item.status == 1 && (item.seller == account || operator)">Close order </el-button>
          <el-button type="primary" @click="handleEvaluateDialog(item)" v-if="item.status == 2 && item.buyer == account && item.evaluate == ''">Evaluate order </el-button>
        </div>
      </div>
    </div>

    <el-dialog title="Publish goods" :visible.sync="createOrderVisible" width="500px">
      <el-form :model="form">
        <el-form-item label="Seller Address">
          <el-input v-model="account" disabled></el-input>
        </el-form-item>
        <el-form-item label="Image Url">
          <el-input v-model="form.imgUrl"></el-input>
        </el-form-item>
        <el-form-item label="Price">
          <el-input v-model="form.amount">
            <template slot="append">ETH</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Describe">
          <el-input v-model="form.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleNewOrder">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Evaluation order" :visible.sync="evaluateOrderVisible" width="500px">
      <el-form :model="formEva">
        <el-form-item label="Order id">
          <el-input v-model="formEva.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="Evaluation">
          <el-input v-model="formEva.evaluate"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleEvaluateOrder">Confirm</el-button>
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
      <div>Is whiteList: {{ queryForm.whiteList ? '是' : '不是' }}</div>
    </el-dialog>
    <el-dialog title="View order details" :visible.sync="orderDetailVisible" width="500px">
      <img :src="orderDetail.imgUrl" :onerror="defaultImg" alt="" class="orderImg" />

      <div>Order seller: {{ orderDetail.seller }}</div>
      <div>Order id: {{ orderDetail.id }}</div>
      <div>Price: {{ formatAmount(orderDetail.amount) }} ETH</div>
      <div>Describe: {{ orderDetail.describe }}</div>
      <div>Status: {{ orderDetail.status == 0 ? 'Closed' : orderDetail.status == 1 ? 'On the shelf' : 'Completed' }}</div>
      <div v-if="orderDetail.status == 2">Evaluation: {{ orderDetail.evaluate }}</div>
    </el-dialog>
  </div>
</template>
<script>
import { getMarketContract } from '@/utils/contractHelp';
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
      createOrderVisible: false, //发布商品弹窗
      evaluateOrderVisible: false, //评价订单弹窗
      marketList: [],
      menuList: [
        {
          name: 'On the shelf',
          key: 0,
        },
        {
          name: '订单关闭',
          key: 1,
        },
        {
          name: '订单Completed',
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
      orderDetail: {},
      orderDetailVisible: false,
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
    handleOrderDetail(item) {
      this.orderDetailVisible = true;
      this.orderDetail = item;
    },
    async handleQueryUser(address) {
      const marketContract = getMarketContract();
      const user = await marketContract.methods.users(address).call();
      this.queryUserVisible = true;
      this.queryForm = { ...user, address: address };
    },
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
        return item.seller.toLowerCase().includes(this.inputAddress.toLowerCase()) || item.buyer.toLowerCase().includes(this.inputAddress.toLowerCase());
      });
    },

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
        this.$message.success('Publish successfully');
        this.createOrderVisible = false;
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
    async handleBuy(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.buy(item.id).estimateGas({ from: this.account, value: item.amount });
        await marketContract.methods.buy(item.id).send({ from: this.account, gas: gasProcessing(gas), value: item.amount });
        this.$message.success('Purchase successfully');
        this.getMarket();
      } catch (e) {
        this.$message.error(e.message || e + '');
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
        this.$message.success('Evaluate successfully ');
        this.formEva.id = {
          id: '',
          evaluate: '',
        };
        this.evaluateOrderVisible = false;
        this.getMarket();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    },
    async handleCloseOrder(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.closeOrder(item.id).estimateGas({ from: this.account });
        await marketContract.methods.closeOrder(item.id).send({ from: this.account, gas: gasProcessing(gas) });
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
  .orderImg {
    height: 200px;
    width: 200px;
    margin: 0 auto;
    display: inline-block;
  }
}
</style>
