<template>
  <q-page class="q-pa-lg gutter-md">
    <div class="row gutter-md">
      <div class="col-sm">
        <q-field error-label="请选择转出账户"
                 :error="$v.form.from.$error">
          <q-select float-label="转出账户"
                    v-model="form.from"
                    :options="options()" />
        </q-field>
      </div>
      <div class="col-sm">
        <q-field error-label="不是合法的账户地址"
                 :error="$v.form.to.$error">
          <q-input v-model="form.to"
                   float-label="转入账户"
                   placeholder="0x0000..."
                   @blur="$v.form.to.$touch" />
        </q-field>
      </div>

    </div>
    <div class="row gutter-md">
      <div class="col-sm">
        <q-field error-label="转出金额必须大于0"
                 :error="$v.form.amount.$error">
          <q-input float-label="转出金额"
                   v-model="form.amount"
                   type="number"
                   :suffix="$unit"
                   clearable
                   @blur="$v.form.amount.$touch"/>
        </q-field>
      </div>
      <div class="col-sm">
        <q-input stack-label="余额"
                 v-model="balance"
                 disable
                 :suffix="$unit" />
      </div>
    </div>
    <div class="row gutter-md">
      <div class="col-sm">
        <q-btn icon="send"
               label="确认转账"
               color="secondary"
               @click="transfer"
               :disable="disabled">
        </q-btn>
      </div>
      <div class="col-sm">
        估计交易费用：{{gasFee}}
      </div>
    </div>

    <q-modal v-model="showConfirmModal"
             minimized
             position="top"
             :content-css="{padding: '30px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-display-1">确认转账</div>
      </div>
      <div class="row justify-center"><ident-icon :value="form.from"/></div>
      <div class="row q-pa-md">{{form.from}}</div>
      <div class="row justify-center"><q-icon name="arrow_downward" /></div>
      <div class="row q-pa-md">{{form.to}}</div>
      <div class="row q-pa-md">
        <div class="col">转出金额：</div>
        <div>{{form.amount}} {{$unit}}</div>
      </div>
      <div class="row q-pa-md">
        <div class="col">手续费：</div>
        <div>{{gasFee}} {{$unit}}</div>
      </div>
      <div class="row q-pa-md">
        <div class="col">总金额：</div>
        <div class="text-negative"><big>{{total}}</big> {{$unit}}</div>
      </div>
      <div class="row q-pa-md gutter-md justify-end">
        <div>

          <q-btn color="tertiary"
                 @click="showConfirmModal = false; disabled = false"
                 label="取消" />
        </div>
        <div>
          <q-btn color="secondary"
                 @click="confirm"
                 label="确认" />
        </div>
      </div>
    </q-modal>

  </q-page>
</template>

<script>
import _ from 'lodash'
import { required, numeric } from 'vuelidate/lib/validators'
import { ipcRenderer } from 'electron'
import BigNumber from 'bignumber.js'
const BN = BigNumber
import { address } from '../validators'
import { Types } from '../../src-electron/lib/channel/types'

export default {
  name: 'PageTransfer',
  data () {
    return {
      showConfirmModal: false,
      form: {
        from: this.getFrom(),
        to: '',
        amount: ''
      },
      balance: 0,
      gasFee: 0,
      total: 0,
      disabled: false
    }
  },
  validations: {
    form: {
      from: { required },
      to: { required, address },
      amount: { required, numeric }
    }
  },
  watch: {
    'form.from': function (newAddress, oldAddress) {
      this.balance = this.getAccountEther(newAddress)
    },
    'form.to': function () {
      this.estimateGas()
    },
    'form.amount': function () {
      this.estimateGas()
    }
  },
  methods: {
    estimateGas: _.debounce(function () {
      let validTo = this.$web3.utils.isAddress(this.form.to)
      let amount = _.toNumber(this.form.amount)

      if (validTo && !isNaN(amount) && amount > 0) {
        let from = this.form.from
        let to = this.form.to
        let value = this.$web3.utils.toWei(new BN(amount).toFixed())
        Promise.all([
          this.$web3.eth.estimateGas({ from, to, value }),
          this.$web3.eth.getGasPrice()
        ])
          .then(([gas, price]) => {
            console.log('estimateGas = ', gas, ', gasPrice = ', price)
            let fee = new BN(gas).times(new BN(price)).toFixed()
            console.log('transfer fee: ', fee)
            this.gasFee = this.$web3.utils.fromWei(fee)
            this.total = new BN(this.gasFee).plus(new BN(this.form.amount)).toFixed()
          })
          .catch(console.log)
      }
    }, 400),
    getFrom () {
      if (this.$route.params.address) {
        return this.$route.params.address
      } else {
        return ''
      }
    },
    getAccountEther (address) {
      if (address) {
        let account = this.$store.getters['account/get'](address)
        if (account != null) {
          return account.ether
        }
      }
      return ''
    },
    options () {
      let accounts = this.$store.state.account.list
      let options = accounts.map(account => {
        return {
          label: account.name,
          sublabel: account.address,
          value: account.address,
          avatar: this.$icon(account.address.toLowerCase())
        }
      })
      return options
    },
    transfer () {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        this.disabled = true
        this.showConfirmModal = true
      }
    },
    confirm () {
      this.showConfirmModal = false

      let tx = {
        from: this.form.from,
        to: this.form.to,
        value: this.$web3.utils.toWei(this.form.amount.toString())
      }
      this.$q
        .dialog({
          title: '请输入账户密码',
          preventClose: false,
          position: 'top',
          prompt: {
            type: 'password'
          }
        })
        .then(password => {
          ipcRenderer.send(Types.SEND_TRANSACTION, { tx, password })
        })
        .catch(() => {
          this.disabled = false
        })
    }
  },

  created () {
    this.$emit('updateToolbar', '转账', 'fa-exchange-alt')
    const $vm = this
    ipcRenderer.removeAllListeners(Types.SEND_TRANSACTION_REPLY)

    ipcRenderer.on(Types.SEND_TRANSACTION_REPLY, (event, reply) => {
      console.log('send transaction reply: ', reply)
      if (reply.error && reply.error === 'invalid-password') {
        $vm.$q.notify('密码错误！')
        $vm.disabled = false
      } else {
        $vm.$router.push('/wallet')
      }
    })
  }
}
</script>
