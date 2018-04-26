<template>
  <q-item>
    <q-item-side>
      <div class="row justify-center">
        {{date(item.timestamp)}}
      </div>
    </q-item-side>
    <q-item-main>
      <q-item-tile>
        <ident-icon :value="item.from.toLowerCase()" />
        <span> {{accountName(item.from)}} </span>
        <q-icon name="send"
                color="grey-5 q-px-md" />
        <ident-icon :value="item.to.toLowerCase()" />
        <span> {{accountName(item.to)}} </span>
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
      <q-item-tile color="negative">
        -{{toSMT(item.value)}} {{$unit}}
      </q-item-tile>
    </q-item-side>
  </q-item>
</template>

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
