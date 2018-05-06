<template>
 <div class="trans-container" @click="viewTransaction(item)">
   <q-item class="trans-item">
     <q-item-side>
       <div class="row justify-center">
         {{date(item.timestamp)}}
       </div>
     </q-item-side>
     <q-item-main>
       <q-item-tile>
         <ident-icon :value="item.from.toLowerCase()" />
         <span :title="item.from" class="trans-from"> {{accountName(item.from)}} </span>
         <q-icon name="send"
                 color="grey-5 q-px-md" />
         <ident-icon :value="item.to.toLowerCase()" />
         <span :title="item.to" class="trans-to"> {{accountName(item.to)}} </span>
       </q-item-tile>
     </q-item-main>
     <q-item-main>
       <q-item-tile :class="{hidden: !showElapsedTime}">
         <span> {{now(item.timestamp)}} </span>
       </q-item-tile>
       <q-item-tile :class="{hidden: !showProgress}">
         <q-progress :percentage="progress" />
       </q-item-tile>
       <q-item-tile :class="{hidden: !showProgress}">
         <span> {{item.confirmCount}} / {{$settings.requiredConfirmations}} {{$t('tx.list.unconfirmed')}} </span>
       </q-item-tile>
       <q-item-tile :class="{hidden: !isPending}">
         <span> {{$t('tx.list.unconfirmed')}} </span>
       </q-item-tile>
     </q-item-main>
     <q-item-side right>
       <q-item-tile class="trans-fee" color="negative">
         -{{toSMT(item.value)}} {{$unit}}
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
       <div class="col">{{$t('tx.transfer.from')}}：</div>
       <div>{{item.from}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.to')}}：</div>
       <div>{{item.to}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.block_number')}}：</div>
       <div>{{item.blockNumber}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.transaction_hash')}}：</div>
       <div>{{item.hash}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.confirm.transfer_amount')}}：</div>
       <div>{{toSMT(item.value)}} {{$unit}}</div>
     </div>
     <div class="row q-pa-md">
       <div class="col">{{$t('tx.transfer.confirm.fee')}}：</div>
       <div>{{toSMT(item.receipt.gasUsed * item.gasPrice)}} {{$unit}}</div>
     </div>
   </q-modal>
 </div>
</template>
<style lang="stylus">
div.trans-container
    height 60px
    font-size 15px
    line-height 21px
    color #333333
    border-radius 2px !important
    background-color #FFFFFF !important
    vertical-align middle
    padding-top 11px
div.trans-container:nth-child(1)
    margin-top:-20px
div.trans-container:not(:first-child)
    margin-top:10px
div.trans-container:hover
    background: #F9FEFF !important
div.trans-item .q-item-side
    color #999999 !important
div.trans-item .trans-fee
    color #FA5A53 !important
div.trans-item .trans-from
    margin-left: 10px
div.trans-item .trans-to
    margin-left 10px
</style>

<script>
import BigNumber from 'bignumber.js'
const web3 = window.web3

export default {
  name: 'TransactionItem',
  props: ['item'],
  data () {
    return {
      showTransactionModal: false
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
      return this.$moment(timestamp).format('MMMM Do')
    },
    now (timestamp) {
      return this.$moment.unix(timestamp).fromNow()
    },
    toSMT (value) {
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
      this.showTransactionModal = true
      console.log(this.item)
    }
  }
}
</script>
