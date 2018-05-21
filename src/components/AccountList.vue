<template>
  <div>
    <h1 class="account-title">{{ $t('account.account_list') }}
      <em class="total-unit text-warning float-right"> {{ $t('account.total_balance') }}：<ani-number class="total-unit" :value="total"/> {{$unit}}</em>
    </h1>
    <q-list class="account-list" highlight
            sparse
            inset-separator
            no-border>
      <!--<q-list-header v-if="accounts.length == 0">现在开始，点击下面的
        <q-icon round
                name="add" />按钮，添加一个账户吧！</q-list-header>-->

      <account-item v-for="account of accounts"
                    :account="account"
                    :key="account.address"
                    :to="'/wallet/account/' + account.address" />
    </q-list>

    <q-btn class="account-btn add-account" size="lg"
           color="primary"
           :label="$t('account.btn.add')"
           @click="showNewAccountModal = true" />

    <q-btn class="account-btn import-account" size="lg"
           color="primary"
           :label="$t('account.btn.importAccount')"
           @click="importAccount()" />

    <!-- 创建账号对话框 -->
    <q-modal class="create-account-modal" v-model="showNewAccountModal"
             @hide="reset">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('account.create.title') }}</p>
        <p class="text-warning">{{ $t('account.create.text2') }}</p>
        <q-field :helper="$t('account.create.password_tip1')"
                 v-show="showPasswordField">
          <q-input :float-label="$t('account.create.password_msg1')"
                   :autofocus="showNewAccountModal"
                   type="password"
                   v-model="form.password"
                   @blur="$v.form.password.$touch"
                   :error="$v.form.password.$error" />
        </q-field>

        <q-field :error-label="$t('account.create.password_tip2')"
                 v-show="showPasswordField">
          <q-input :float-label="$t('account.create.password_msg2')"
                   :autofocus="!showPasswordField"
                   type="password"
                   v-model="form.repeatPassword"
                   @blur="$v.form.repeatPassword.$touch"
                   :error="$v.form.repeatPassword.$error" />
        </q-field>

        <q-btn :label="$t('button.ok')"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>
    <!-- 创建账号对话框 end -->
  </div>
</template>
<style lang="stylus">
h1.account-title
    color #333333
    font-weight bold
    line-height 22px
    font-size 16px
    padding-bottom 20px
    border-bottom 1px solid #DEE3E7 !important
    margin-top -15px
.total-unit
    font-size 17px
    font-weight bold
    color #FFBB44 !important
    letter-spacing 2px
.account-btn
    font-size 14px !important
    line-height 20px
    width 120px
    margin-top 10px
    padding 0px 3px
    border-radius 2px
    background-color #10A0F8 !important
.import-account
    margin-left 16px
div.account-list
    margin-top -15px
div.create-account-modal .q-headline
    color #333333 !important
    font-size 18px
    line-height 25px
div.create-account-modal .text-warning
    color #FA5A53 !important
    font-size 15px
    line-height 21px
div.create-account-modal .text-1
    color #999999
    font-size 16px
    line-height 22px
div.create-account-modal .q-btn
    background-color #10A0F8 !important
    border-radius 2px
</style>
<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

import BigNumber from 'bignumber.js'
import { Types } from '../../src-electron/modules/ipc/types'
import { shell } from 'electron'
import path from 'path'

const ipc = window.ipc
const web3 = window.web3

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
      return new BigNumber(web3.utils.fromWei(total.toFixed())).toFixed(3, 1)
    }
  },
  methods: {
    submit () {
      this.$v.form.password.$touch()
      if (!this.$v.form.password.$error) {
        this.$v.form.repeatPassword.$touch()
        if (this.$v.form.repeatPassword.$error) {
          return
        }
      } else {
        return
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
      // console.log('call createAccount()')
      // let $vm = this
      web3.eth.personal
        .newAccount(this.form.password)
        .then(() => {
          // $vm.refreshAccountList()
          ipc.send(Types.SYNC_ACCOUNT)
        })
        .catch(console.log)
    },
    importAccount () {
      let keystore = path.join(this.$settings.chainDataPath, 'keystore')
      shell.showItemInFolder(keystore)
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
