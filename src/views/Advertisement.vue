<template>
  <div class="home">
    <div><el-button type="primary" style="margin: 20px 0" @click="handleQueryUser(account)">个人信息</el-button></div>

    <el-button type="primary" @click="createAdvertisementVisible = true">发布信息</el-button>
    <div class="inputWrap">
      <el-input style="width: 200px" v-model="inputAddress" placeholder="搜索地址"></el-input>
      <el-button type="primary" @click="handleAddressSearch">搜索地址</el-button>
    </div>
    <div class="menuWrap">
      <div v-for="(item, index) in menuList" :key="index" @click="menuIndex = index">
        <div v-if="owner || (index != 1 && index != 2)" class="menuItem" :class="index == menuIndex && 'active'">{{ item.name }}</div>
      </div>
    </div>

    <div class="list">
      <div class="topInfo" v-for="(item, index) in getMarketList" :key="index">
        <div>
          <img v-if="item.imgUrl" :src="item.imgUrl" :onerror="defaultImg" alt="" class="advertisementImg" />
          <div class="desibl">信息内容: {{ item.describe }}</div>
          <br />
          <div><span class="userInfo" @click="handleQueryUser(item.publisher)">查看发布者信息</span></div>
          <!-- <div class="userInfo" @click="handleAdDetail(item)">View order details</div> -->
          <div>发布地址: {{ item.publisher }}</div>
          <div>发布时间: {{ new Date(item.time * 1000).toLocaleString() }}</div>
        </div>

        <div>
          <el-button type="primary" @click="handleAuditAdvertisement(item)" v-if="item.status == 1 && owner">审核通过</el-button>
          <el-button type="danger" @click="handleCloseAdvertisement(item)" v-if="(item.status == 1 || item.status == 2) && (item.publisher == account || owner)">关闭广告 </el-button>
        </div>
      </div>
    </div>

    <el-dialog title="发布信息" :visible.sync="createAdvertisementVisible" width="500px">
      <el-form :model="form">
        <el-form-item label="发布者地址">
          <el-input v-model="account" disabled></el-input>
        </el-form-item>
        <el-form-item label="图片Url（可选）">
          <el-input v-model="form.imgUrl"></el-input>
        </el-form-item>
        <el-form-item label="信息内容（可选）">
          <el-input v-model="form.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleNewAdvertisement">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="查看用户信息" :visible.sync="queryUserVisible" width="500px">
      <div>账号地址: {{ queryForm.address }}</div>
      <div>姓名: {{ queryForm.name }}</div>
      <div>电话: {{ queryForm.telephone }}</div>
      <div>性别: {{ queryForm.sex }}</div>
      <div>Email: {{ queryForm.email }}</div>
      <div>简介: {{ queryForm.introduce }}</div>
    </el-dialog>
    <el-dialog title="View advertising details" :visible.sync="adDetailVisible" width="500px">
      <img :src="adDetail.imgUrl" :onerror="defaultImg" alt="" class="advertisementImg" />
      <div>发布者地址: {{ adDetail.publisher }}</div>
      <div>信息id: {{ adDetail.id }}</div>
      <div>发布时间: {{ new Date(adDetail.time * 1000).toLocaleString() }}</div>
      <div>信息内容: {{ adDetail.describe }}</div>
      <div>状态: {{ adDetail.status == 0 ? '已关闭' : adDetail.status == 1 ? '审核中' : '上架' }}</div>
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
          return item.status == 1 && (item.publisher == this.account || this.owner);
        });
      }
      if (this.menuIndex == 2) {
        return this.marketList.filter(item => {
          return item.status == 0 && (item.publisher == this.account || this.owner);
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
          name: '上架',
          key: 0,
        },
        {
          name: '审核中',
          key: 1,
        },
        {
          name: '下架',
          key: 2,
        },

        {
          name: '我的信息',
          key: 3,
        },
      ],
      menuIndex: 0,
      owner: false, //是否为操作员
      queryForm: {
        address: '',
        name: '',
        telephone: '',
        sex: '',
        email: '',
        introduce: '',
      },
      queryUserVisible: false,
      defaultImg: 'this.src="' + require('../assets/img/error.png') + '"',
      adDetailVisible: false,
      adDetail: {},
    };
  },
  async created() {
    this.getOwner();
    this.getMarket();
  },
  beforeDestroy() {},
  mounted() {},
  watch: {
    account() {
      this.getOwner();
      this.getMarket();
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
        marketContract.methods
          .auditAdvertisement(item.id, 2)
          .send({ from: this.account, gas: gasProcessing(gas) })
          .on('transactionHash', hash => {
            this.userVisible = false;
          })
          .on('receipt', receipt => {
            this.$message.success('操作成功');
            this.getMarket();
          });
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

    async getOwner() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      const owner = await marketContract.methods.owner().call();
      if (owner == this.account) {
        this.owner = true;
      } else {
        this.owner = false;
      }
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
      console.log(this.marketList);
    },
    async handleNewAdvertisement() {
      const marketContract = getMarketContract(this.provider);
      const { imgUrl, describe } = this.form;
      try {
        const gas = await marketContract.methods.newAdvertisement(imgUrl, describe).estimateGas({ from: this.account });
        await marketContract.methods
          .newAdvertisement(imgUrl, describe)
          .send({ from: this.account, gas: gasProcessing(gas) })
          .on('transactionHash', hash => {
            this.createAdvertisementVisible = false;
            this.form = {
              imgUrl: '',
              describe: '',
            };
          })
          .on('receipt', receipt => {
            this.$message.success('发布成功');
            this.getMarket();
          });
      } catch (e) {
        console.log(e.code, 'ee');

        console.log(Object.keys(e));
        this.$message.error(e.message || e + '');
      }
    },

    // 下架关闭广告
    async handleCloseAdvertisement(item) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.closeAdvertisement(item.id).estimateGas({ from: this.account });
        await marketContract.methods
          .closeAdvertisement(item.id)
          .send({ from: this.account, gas: gasProcessing(gas) })
          .on('transactionHash', hash => {})
          .on('receipt', receipt => {
            this.$message.success('关闭成功');
            this.getMarket();
          });
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
  .advertisementImg {
    height: 200px;
    width: 200px;
    display: inline-block;
  }
}
</style>
