<template>
  <q-item class="trans-item">
    <q-item-side>
      <div class="row justify-center">
        {{date(item.timestamp)}}
      </div>
    </q-item-side>
    <q-item-main>
      <q-item-tile>
        <ident-icon :value="item.from.toLowerCase()" />
        <span class="trans-from"> {{accountName(item.from)}} </span>
        <q-icon name="send"
                color="grey-5 q-px-md" />
        <ident-icon :value="item.to.toLowerCase()" />
        <span class="trans-to"> {{accountName(item.to)}} </span>
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
        <span> {{item.confirmCount}} / {{$settings.requiredConfirmations}} 块确认 </span>
      </q-item-tile>
      <q-item-tile :class="{hidden: !isPending}">
        <span> 待确认 </span>
      </q-item-tile>
    </q-item-main>
    <q-item-side right>
      <q-item-tile class="trans-fee" color="negative">
        -{{toSMT(item.value)}} {{$unit}}
      </q-item-tile>
    </q-item-side>
  </q-item>
</template>
<style lang="stylus">
div.trans-item
    height 60px
    margin-top:10px
    font-size 15px
    line-height 21px
    color #333333
div.trans-item:nth-child(2n)
    background-color #F9FEFF !important
div.trans-item:nth-child(2n-1)
    background-color #FFFFFF !important
div.trans-item .q-item-side
    color #999999 !important
div.trans-item .trans-fee
    color #FA5A53 !important
div.trans-item .trans-from
  margin-left: 10px
div.trans-item .trans-to
  margin-left: 10px
</style>

<script>
import BigNumber from 'bignumber.js'
const web3 = window.web3

export default {
  name: 'TransactionItem',
  props: ['item'],
  data () {
    return {
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
      return this.$store.getters['account/name'](address)
    }
  }
}
</script>
