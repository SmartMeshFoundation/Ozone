<template>
  <div>
    <h1>账户列表
      <em class="text-warning float-right"> 总资产：<ani-number :value="total"/> {{$unit}}</em>
    </h1>
    <q-list highlight
            sparse
            inset-separator
            no-border>
      <q-list-header v-if="accounts.length == 0">现在开始，点击下面的
        <q-icon round
                name="add" />按钮，添加一个账户吧！</q-list-header>

      <account-item v-for="account of accounts"
                    :account="account"
                    :key="account.address"
                    :to="'/wallet/account/' + account.address" />
    </q-list>

    <q-btn flat
           color="secondary"
           icon="add"
           label="创建一个新账户"
           @click="showNewAccountModal = true" />

    <!-- 创建账号对话框 -->
    <q-modal v-model="showNewAccountModal"
             position="top"
             @hide="reset">
      <div class="q-pa-md">
        <p class="q-headline">建一个新账户</p>
        <p>为你的账户设置密码。</p>
        <p class="text-warning">请牢记你的密码，如果遗忘密码将没有任何途径可以找回！</p>
        <q-field icon="fa-key"
                 helper="账户密码必须不少于8位"
                 v-show="showPasswordField">
          <q-input float-label="输入账户密码"
                   :autofocus="showNewAccountModal"
                   type="password"
                   v-model="form.password"
                   @blur="$v.form.password.$touch"
                   :error="$v.form.password.$error" />
        </q-field>

        <q-field icon="fa-key"
                 error-label="两次输入的密码不一致，请重新输入！"
                 v-show="showPasswordField == false">
          <q-input float-label="重复输入密码"
                   :autofocus="!showPasswordField"
                   type="password"
                   v-model="form.repeatPassword"
                   @blur="$v.form.repeatPassword.$touch"
                   :error="$v.form.repeatPassword.$error" />
        </q-field>

        <q-btn label="确定"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>
    <!-- 创建账号对话框 end -->
  </div>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
// import { shell } from 'electron'
// import setting from '../../src-electron/lib/setting'
// import fs from 'fs-extra'
import BigNumber from 'bignumber.js'
import { ipcRenderer } from 'electron'

export default {
  name: 'AccountList',
  data () {
    return {
      showNewAccountModal: false,
      showPasswordField: true,
      form: {
        password: '',
        repeatPassword: ''
      }
    }
  },
  computed: {
    accounts () {
      return this.$store.state.account.list
    },
    total () {
      let total = this.$store.state.account.list.reduce((prev, curr) => {
        return prev.plus(curr.balance)
      }, new BigNumber(0))
      return new BigNumber(this.$web3.utils.fromWei(total.toFixed())).toFixed(2)
    }
  },
  methods: {
    submit () {
      if (this.showPasswordField) {
        this.$v.form.password.$touch()
        if (!this.$v.form.password.$error) {
          this.showPasswordField = false
        }
        return
      } else if (this.showRepeatPasswordField) {
        this.$v.form.repeatPassword.$touch()
        if (this.$v.form.repeatPassword.$error) {
          return
        }
      }
      this.createAccount()
      this.reset()
    },
    reset () {
      // 清空表单
      this.$v.$reset()
      this.form.password = ''
      this.form.repeatPassword = ''

      this.showNewAccountModal = false
      this.showPasswordField = true
    },
    createAccount () {
      console.log('call createAccount()')
      // let $vm = this
      // ipcRenderer.send(channels.NEW_ACCOUNT, { password: this.form.password })
      this.$web3.eth.personal
        .newAccount(this.form.password)
        .then(() => {
          // $vm.refreshAccountList()
          ipcRenderer.send('restore-state', 'account')
        })
        .catch(console.log)
    }
  },
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(8)
      },
      repeatPassword: {
        sameAsPassword: sameAs('password')
      }
    }
  },
  created () {
    // this.refreshAccountList()
  }
}
</script>
