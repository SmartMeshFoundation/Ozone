<template>
 <div class="trans-container" @click="viewTransaction(item)">
   <div>{{date(item.timestamp)}}</div>
   <div>
     <span v-if="item.to != null && item.input === '0x'" >{{ $t('tx.type.a2a') }}</span>
     <span v-if="item.to != null && item.input !== '0x'" >{{ $t('tx.type.call_c') }}</span>
     <span v-if="item.to == null" >{{ $t('tx.type.create_c') }}</span>
   </div>
   <div>
     <ident-icon :value="item.from.toLowerCase()" />
     <span class="text-overflow" :title="item.from"> {{accountName(item.from)}} </span>
     <span v-if="item.to != null">
         <q-icon name="send" class="btn-send"
                 color="grey-5 q-px-md" />
         <ident-icon :value="item.to.toLowerCase()" />
         <span class="text-overflow" :title="item.to"> {{accountName(item.to)}} </span>
     </span>
   </div>
   <div>
     <div :class="{hidden: !showElapsedTime}">
       <span> {{fromNow(item.timestamp)}} </span>
     </div>
     <!--<div :class="{hidden: !showProgress}">
       <q-progress :percentage="progress" />
     </div>-->
     <div :class="{hidden: !showProgress}">
       <span> {{item.confirmCount}} / {{$settings.requiredConfirmations}} {{$t('tx.list.block_confirm')}} </span>
     </div>
     <div :class="{hidden: !isPending}">
       <span> {{$t('tx.list.pending')}} </span>
     </div>
   </div>
   <!-- <div>
    <span v-if="checkTransDir() === 1" style="font-size:14px;background-color: #F8A656;display: block;line-height: 30px;text-align: center;width: 100%;color: white;border-radius: 4px;margin: 0 0 !important;">
     OUT
    </span>
    <span v-if="checkTransDir() === 2" style="font-size:14px;background-color: #6BC408;display: block;line-height: 30px;text-align: center;width: 100%;color: white;border-radius: 4px;margin: 0 0 !important;">
     IN
    </span>
    <span v-if="checkTransDir() === 0" style="font-size:14px;background-color: #6ecafc;display: block;line-height: 30px;text-align: center;width: 100%;color: white;border-radius: 2px;margin: 0 0 !important;">
     SELF
    </span>
   </div> -->
   <div :style="{color: signColor, overflow: 'hidden'}">
     {{sign}}{{toSMT(item.value)}} {{$unit}}
   </div>
   <q-modal class="transfer-item" v-model="showTransactionModal"
            minimized
            :content-css="{padding: '30px'}">

     <div class="row justify-center q-mb-md">
       <div class="q-display-1">{{$t('tx.transfer.transaction_detail')}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.transaction_hash')}}：</div>
       <div>{{item.hash}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.block_number')}}：</div>
       <div>{{item.blockNumber}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.from')}}：</div>
       <div>{{item.from}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.to')}}：</div>
       <div>{{item.to}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.confirm.transfer_amount')}}：</div>
       <div>{{toSMT(item.value)}} {{$unit}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.confirm.fee')}}：</div>
       <div>{{ gasFee }} {{$unit}}</div>
     </div>
   </q-modal>
 </div>

</template>
<style lang="stylus">
div.trans-container
    // height 60px
    font-size 15px
    line-height 40px
    color #333333
    border-radius 2px !important
    background-color #FFFFFF !important
    vertical-align middle
    // padding-top 11px
    display table
    width 100%
    padding 0px 0px 0px 20px
div.trans-container div
    display table-cell
    line-height 60px
    text-align left
div.trans-container div:nth-child(1)
    width 15%
div.trans-container div:nth-child(2)
    width 15%
div.trans-container div:nth-child(3)
  width 40%
div.trans-container div:nth-child(4)
  width 10%
div.trans-container div:nth-child(5)
  color red
  width 20%
.text-overflow{
  display inline-block
  width 6.5em
  overflow hidden
  text-overflow ellipsis
  white-space nowrap
  vertical-align middle
}
div.trans-container:nth-child(1)
    // margin-top:-20px
div.trans-container:not(:first-child)
    margin-top:10px
div.trans-container:hover
    background: #F9FEFF !important
div.trans-date
    width 14%
div.trans-type
    padding-left 10px
    width 16%
.btn-send
    width 1%
div.trans-acct
    width 45%
div.trans-pro
    width 10%
div.trans-item .q-item-side
    color #999999 !important
div.trans-item .trans-fee
    color #FA5A53 !important
</style>

<script>
import BigNumber from 'bignumber.js'
import _ from 'lodash'
const BN = BigNumber
const web3 = window.web3

export default {
  name: 'TransactionItem',
  props: ['item'],
  data () {
    return {
      address: this.$route.params.address,
      showTransactionModal: false,
      gasFee: 0,
      accounts: []
    }
  },
  computed: {
    progress () {
      let required = this.$settings.requiredConfirmations
      let confirmCount = this.item.confirmCount
      return confirmCount / required * 100
    },
    showElapsedTime () {
      return !this.showProgress && !this.isPending
    },
    showProgress () {
      return !this.item.confirmed && !this.isPending
    },
    isPending () {
      return this.item.blockNumber == null
    },
    sign () {
      let from = this.item.from.toLowerCase()
      // let to = this.item.to.toLowerCase()
      let s = ''
      if (this.address) {
        let a = this.address.toLowerCase()
        if (a === from) {
          s = '-'
        } else {
          s = '+'
        }
      }
      return s
    },
    signColor () {
      if (this.sign === '-') {
        return 'red'
      } else if (this.sign === '+') {
        return 'green'
      } else {
        return '#0c0c0c'
      }
    }
  },
  methods: {
    date (timestamp) {
      return this.$moment.unix(timestamp).format('YYYY-MM-DD')
    },
    fromNow (timestamp) {
      return this.$moment.unix(timestamp).fromNow()
    },
    toSMT (value) {
      if (!value) {
        return 0
      }
      return web3.utils.fromWei(new BigNumber(value).toFixed())
    },
    checkTransDir () {
      let from = this.item.from.toLowerCase()
      let to = this.item.to.toLowerCase()
      if (from === to) {
        return 0
      }
      if (this.address !== undefined) {
        if (from === this.address.toLowerCase()) {
          return 1
        }
        if (to === this.address.toLowerCase()) {
          return 2
        }
      } else {
        if (this.accounts.includes(from) && this.accounts.includes(to)) {
          return 0
        }
        if (this.accounts.includes(from)) {
          return 1
        }
        if (this.accounts.includes(to)) {
          return 2
        }
      }
    },

    accountName (address) {
      let accountName = this.$store.getters['account/name'](address)
      return accountName
    },
    viewTransaction (item) {
      this.showTransactionModal = true
      if (!this.item.receipt) {
        this.estimateGas()
      } else {
        this.gasFee = this.toSMT(this.item.receipt.gasUsed * this.item.gasPrice)
      }
    },
    estimateGas: _.debounce(function () {
      let validTo = web3.utils.isAddress(this.item.to)
      let amount = _.toNumber(this.item.value)

      if (validTo && !isNaN(amount) && amount > 0) {
        let from = this.item.from
        let to = this.item.to
        let value = web3.utils.toWei(new BN(amount).toFixed())
        Promise.all([
          web3.eth.estimateGas({ from, to, value }),
          web3.eth.getGasPrice()
        ])
          .then(([gas, price]) => {
            console.log('estimateGas = ', gas, ', gasPrice = ', price)
            let fee = new BN(gas).times(new BN(price)).toFixed()
            console.log('transfer fee: ', fee)
            this.gasFee = web3.utils.fromWei(fee)
          })
          .catch(console.log)
      }
    }, 400)
  },
  created () {
    let accounts = this.$store.state.account.list
    accounts = accounts.map((account) => {
      return account['address'].toLowerCase()
    })
    this.accounts = accounts
  }
}
</script>
