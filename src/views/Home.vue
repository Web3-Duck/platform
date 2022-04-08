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
        <div>
          <img :src="item.imgUrl" :onerror="defaultImg" alt="" class="orderImg" />
          <div class="userInfo" @click="handleOrderDetail(item)">查看订单详情</div>
          <div>订单卖家: {{ item.seller }} <span class="userInfo" @click="handleQueryUser(item.seller)">查看用户信息</span></div>
          <div>订单id: {{ item.id }}</div>
          <div>商品价格: {{ formatAmount(item.amount) }} ETH</div>
          <div class="desibl">商品描述: {{ item.describe }}</div>
          <div>订单状态: {{ item.status == 0 ? '已关闭' : item.status == 1 ? '上架中' : '已完成' }}</div>
          <div class="desibl" v-if="item.status == 2">商品评价: {{ item.evaluate }}</div>
        </div>

        <div>
          <el-button type="primary" @click="handleBuy(item)" v-if="item.status == 1">立即购买</el-button>
          <el-button type="danger" @click="handleCloseOrder(item)" v-if="item.status == 1 && (item.seller == account || operator)">关闭订单</el-button>
          <el-button type="primary" @click="handleEvaluateDialog(item)" v-if="item.status == 2 && item.buyer == account && item.evaluate == ''">评价此订单</el-button>
        </div>
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
    <el-dialog title="查看订单详情" :visible.sync="orderDetailVisible" width="500px">
      <img :src="orderDetail.imgUrl" :onerror="defaultImg" alt="" class="orderImg" />

      <div>订单卖家: {{ orderDetail.seller }}</div>
      <div>订单id: {{ orderDetail.id }}</div>
      <div>商品价格: {{ orderDetail.amount }}</div>
      <div>商品价格: {{ formatAmount(orderDetail.amount) }} ETH</div>
      <div>商品描述: {{ orderDetail.describe }}</div>
      <div>订单状态: {{ orderDetail.status == 0 ? '已关闭' : orderDetail.status == 1 ? '上架中' : '已完成' }}</div>
      <div v-if="orderDetail.status == 2">商品评价: {{ orderDetail.evaluate }}</div>
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
    // https://portrait.gitee.com/uploads/avatars/user/20/61279_fuhai_1578915942.png
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
        this.$message.error(e.message || e + '');
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
        this.$message.success('评价成功');
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
