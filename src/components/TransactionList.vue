<template>
  <div>
    <h1>最近交易</h1>
    <q-list highlight
            no-border
            striped-odd
            sparse
            class="q-mt-lg transaction">
      <q-list-header v-if="trans.length === 0">还没有历史交易</q-list-header>
      <q-item v-for="tx of trans" :key="tx.hash" style="bg-green">
        <q-item-side>
          <div class="row justify-center">
            {{date(tx.timestamp)}}
          </div>
        </q-item-side>
        <q-item-main>
          <q-item-tile>
            <ident-icon :value="tx.from.toLowerCase()" />
            <span> {{accountName(tx.from)}} </span>
            <q-icon name="send" color="grey-5 q-px-md" />
           <ident-icon :value="tx.to.toLowerCase()" />
            <span> {{accountName(tx.to)}} </span>
          </q-item-tile>
        </q-item-main>
        <q-item-main>
          <q-item-tile>
            <span> {{now(tx.timestamp)}} </span>
          </q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-item-tile color="negative">
            -{{toSMT(tx.value)}} {{$unit}}
          </q-item-tile>
        </q-item-side>
      </q-item>
    </q-list>
  </div>
</template>

<style lang="stylus">
div.transaction img.q-item-avatar
    width 24px
    height 24px
    vertical-align middle
</style>

<script>
import BigNumber from 'bignumber.js'

export default {
  name: 'TransactionList',
  data () {
    return {
      locale: this.$i18n.locale
    }
  },
  computed: {
    trans () {
      return this.$store.state.transaction.list
    }
  },
  methods: {
    date (timestamp) {
      return this.$moment(timestamp).format('MMMM Do')
    },
    now (timestamp) {
      return this.$moment(timestamp).fromNow()
    },
    toSMT (value) {
      return this.$web3.utils.fromWei(new BigNumber(value, 16).toFixed())
    },
    accountName (address) {
      return this.$store.getters['account/name'](address)
    }
  }
}
</script>
