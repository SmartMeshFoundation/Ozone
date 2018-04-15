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
      <q-item-tile>
        <span> {{now(item.timestamp)}} </span>
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

export default {
  name: 'TransactionItem',
  props: ['item'],
  data () {
    return {
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
