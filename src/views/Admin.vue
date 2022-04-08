<template>
  <div class="home">
    <h1 class="title">管理员界面</h1>

    <div class="" style="margin-top: 30px">
      <h2>General function</h2>
      <el-input style="width: 200px; margin-right: 10px" v-model="inputAddress" placeholder="Enter address"></el-input>
      <el-button type="primary" @click="handleQueryOperator">Query whether it is an operator </el-button>
      <el-button type="primary" @click="handleQueryUser">Query user information </el-button>
    </div>
    <div class="" style="margin-top: 30px" v-if="owner">
      <h2>Administrator function</h2>
      <el-input style="width: 200px; margin-right: 10px" v-model="input2Address" placeholder="Enter address"></el-input>
      <el-button type="primary" @click="handleOperator(true)">Set as operator </el-button>
      <el-button type="danger" @click="handleOperator(false)">Cancel operator </el-button>
    </div>
    <div class="" style="margin-top: 30px" v-if="operator">
      <h2>Operator functions</h2>
      <el-button type="primary" @click="handleUpdateUserVisible">Update user information</el-button>
    </div>
    <el-dialog title="Update user information" :visible.sync="userVisible" width="800px" top="5vh">
      <el-form :model="form" :inline="true" class="demo-form-inline" label-position="left" label-width="100px">
        <el-form-item label="Address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="Role">
          <el-input v-model="form.role"></el-input>
        </el-form-item>
        <el-form-item label="Sex">
          <el-input v-model="form.sex"></el-input>
        </el-form-item>
        <el-form-item label="User ID">
          <el-input v-model="form.uid"></el-input>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Telephone">
          <el-input v-model="form.telephone"></el-input>
        </el-form-item>
        <el-form-item label="Introduce">
          <el-input v-model="form.introduce"></el-input>
        </el-form-item>
        <el-form-item label="Preferred trading method">
          <el-input v-model="form.like"></el-input>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="Is whiteList">
          <div>
            <el-select v-model="form.whiteList" style="width: 100%">
              <el-option label="YES" :value="true"></el-option>
              <el-option label="NO" :value="false"></el-option>
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateUser">Confirm</el-button>
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
      const message = whiteList ? 'The account is an operator' : 'This account is not an operator';
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
        this.$message.success('Update successful');
        this.userVisible = false;
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        console.log(e, 'e');
        this.$message.error(e.message || e + '');
      }
    },
    // 设置操作员
    async handleOperator(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setOperator(this.input2Address, status).estimateGas({ from: this.account });
        await marketContract.methods.setOperator(this.input2Address, status).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('Set successfully');
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    }, // 设置白名单
    async handleWhiteList(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setWhiteList(this.inputAddress, status).estimateGas({ from: this.account });
        await marketContract.methods.setWhiteList(this.inputAddress, status).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('Set successfully');
        this.getOperator();
        this.getWhiteList();
        this.getOwner();
      } catch (e) {
        this.$message.error(e.message || e + '');
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
