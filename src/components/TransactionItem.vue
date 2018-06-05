<template>
 <div class="trans-container" @click="viewTransaction(item)">
   <q-item class="trans-item">
     <q-item-side>
       <div class="row justify-center">
         {{date(item.timestamp)}}
       </div>
     </q-item-side>
     <q-item-main>
       <q-item-tile class="q-pb-sm">
         <span v-if="item.to != null && item.input === '0x'" >{{ $t('tx.type.a2a') }}</span>
         <span v-if="item.to != null && item.input !== '0x'" >{{ $t('tx.type.call_c') }}</span>
         <span v-if="item.to == null" >{{ $t('tx.type.create_c') }}</span>
       </q-item-tile>
       <q-item-tile>
         <ident-icon :value="item.from.toLowerCase()" />
         <span :title="item.from" class="trans-from"> {{accountName(item.from)}} </span>
         <span v-if="item.to != null">
         <q-icon name="send"
                 color="grey-5 q-px-md" />
         <ident-icon :value="item.to.toLowerCase()" />
         <span :title="item.to" class="trans-to"> {{accountName(item.to)}} </span>
         </span>
       </q-item-tile>
     </q-item-main>
     <q-item-main class="trans-pro">
       <q-item-tile :class="{hidden: !showElapsedTime}">
         <span> {{fromNow(item.timestamp)}} </span>
       </q-item-tile>
       <q-item-tile :class="{hidden: !showProgress}">
         <q-progress :percentage="progress" />
       </q-item-tile>
       <q-item-tile :class="{hidden: !showProgress}">
         <span> {{item.confirmCount}} / {{$settings.requiredConfirmations}} {{$t('tx.list.block_confirm')}} </span>
       </q-item-tile>
       <q-item-tile :class="{hidden: !isPending}">
         <span> {{$t('tx.list.pending')}} </span>
       </q-item-tile>
     </q-item-main>
     <q-item-side right>
       <q-item-tile class="trans-fee" v-if="address===undefined" color="negative">
         {{toSMT(item.value)}} {{$unit}}
       </q-item-tile>
       <q-item-tile class="trans-fee" v-if="address===item.from" color="negative">
         -{{toSMT(item.value)}} {{$unit}}
       </q-item-tile>
       <q-item-tile class="trans-fee" v-if="address===item.to" color="negative">
         +{{toSMT(item.value)}} {{$unit}}
       </q-item-tile>
     </q-item-side>
   </q-item>
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
    line-height 21px
    color #333333
    border-radius 2px !important
    background-color #FFFFFF !important
    vertical-align middle
    // padding-top 11px
div.trans-container:nth-child(1)
    // margin-top:-20px
div.trans-container:not(:first-child)
    margin-top:10px
div.trans-container:hover
    background: #F9FEFF !important
div.trans-item .q-item-side
    color #999999 !important
div.trans-item .trans-fee
    color #FA5A53 !important
    margin-top 25px
div.trans-item .trans-pro
    margin-top 25px
div.trans-item .trans-from
    margin-left: 10px
div.trans-item .trans-to
    margin-left 10px
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
      gasFee: 0
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
    }
  },
  methods: {
    date (timestamp) {
      return this.$moment.unix(timestamp).format('MMMM Do')
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
    accountName (address) {
      let accountName = this.$store.getters['account/name'](address)
      if (accountName.length > 10) {
        return accountName.substr(0, 10) + '...'
      }
      return accountName
    },
    viewTransaction (item) {
      console.log(this.item)
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
  }
}
</script>
