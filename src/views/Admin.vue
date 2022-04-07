<template>
  <div class="home">
    <h1 class="title">管理员界面</h1>

    <div class="" style="margin-top: 30px">
      <h2>通用功能</h2>
      <el-input style="width: 200px; margin-right: 10px" v-model="inputAddress" placeholder="输入地址"></el-input>
      <el-button type="primary" @click="handleQueryOperator">查询是否为操作者</el-button>
      <el-button type="primary" @click="handleQueryUser">查询用户信息</el-button>
    </div>
    <div class="" style="margin-top: 30px" v-if="owner">
      <h2>管理员功能</h2>
      <el-input style="width: 200px; margin-right: 10px" v-model="input2Address" placeholder="输入地址"></el-input>
      <el-button type="primary" @click="handleOperator(true)">设置为操作者</el-button>
      <el-button type="danger" @click="handleOperator(false)">取消操作者</el-button>
    </div>
    <div class="" style="margin-top: 30px" v-if="operator">
      <h2>操作员功能</h2>
      <!-- <el-input style="width: 200px; margin-right: 10px" v-model="inputAddress" placeholder="输入地址"></el-input> -->
      <el-button type="primary" @click="handleUpdateUserVisible">更新用户信息</el-button>
    </div>
    <el-dialog title="更新用户信息" :visible.sync="userVisible" width="800px" top="5vh">
      <el-form :model="form" :inline="true" class="demo-form-inline" label-position="left" label-width="100px">
        <el-form-item label="用户地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="form.role"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="form.sex"></el-input>
        </el-form-item>
        <el-form-item label="用户学号">
          <el-input v-model="form.uid"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.telephone"></el-input>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.introduce"></el-input>
        </el-form-item>
        <el-form-item label="偏好交易方式">
          <el-input v-model="form.like"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="是否白名单">
          <div>
            <el-select v-model="form.whiteList" style="width: 100%">
              <el-option label="是" :value="true"></el-option>
              <el-option label="否" :value="false"></el-option>
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleUpdateUser">确 定</el-button>
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
import { gasProcessing } from '@/utils/format';
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
      input2Address: '',
      form: {
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
      userVisible: false,
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
    handleCancel() {
      this.userVisible = false;
      this.form = {
        address: '',
        uid: '',
        whiteList: false,
        name: '',
        telephone: '',
      };
    },
    handleUpdateUserVisible() {
      this.userVisible = true;
    },
    async handleQueryUser() {
      const marketContract = getMarketContract();
      const user = await marketContract.methods.users(this.inputAddress).call();
      this.queryUserVisible = true;
      this.queryForm = { ...user, address: this.inputAddress };
    },
    async handleQueryOperator() {
      const marketContract = getMarketContract();
      const whiteList = await marketContract.methods.operator(this.inputAddress).call();
      const message = whiteList ? '该账户是操作员' : '该账户不是操作员';
      this.$message.success(message);
    },

    // 更新用户信息
    async handleUpdateUser() {
      const marketContract = getMarketContract(this.provider);
      try {
        const { address, uid, whiteList, name, telephone, sex, email, introduce, like, role } = this.form;
        console.log(this.form, 'this.form');
        const gas = await marketContract.methods.updateUser(address, role, sex, uid, introduce, name, telephone, like, email, whiteList).estimateGas({ from: this.account });
        await marketContract.methods.updateUser(address, role, sex, uid, introduce, name, telephone, like, email, whiteList).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('更新成功');
        this.userVisible = false;
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        console.log(e, 'e');
        this.$message.error(e + '');
      }
    },
    // 设置操作员
    async handleOperator(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setOperator(this.input2Address, status).estimateGas({ from: this.account });
        await marketContract.methods.setOperator(this.input2Address, status).send({ from: this.account, gas: gasProcessing(gas) });
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
