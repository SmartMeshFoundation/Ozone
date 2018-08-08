<template>
    <div class="col-4">
      <q-item class="token-item">
        <q-item-side>
          <ident-icon :value="item.contractAddress" />
        </q-item-side>
        <q-item-main>
          <q-item-tile>{{item.tokenSymbol}}<b>{{balance}}</b></q-item-tile>
        </q-item-main>
      </q-item>
    </div>
</template>

<style lang="stylus">
.token-item
  // width 316px
  height 71px
  border-radius 4px !important
  background-color white
.token-item .q-item-avatar
  width 30px
  height 30px
.token-item .q-item-main div:nth-child(1)
  color #323232
  font-size 15px
  line-height 21px
.token-item .q-item-main div:nth-child(1) b
  float right
  font-weight normal !important
</style>

<script>
import BigNumber from 'bignumber.js'
export default {
  data () {
    return {
    }
  },
  props: {
    item: {
      required: true
    }
  },
  computed: {
    balance () {
      if (this.item.decimals !== 0) {
        let balance_ = new BigNumber(this.item.balance)
        let decimals = this.item.decimals
        let ten = new BigNumber('10')
        decimals = ten.pow(parseInt(decimals))
        return balance_.div(decimals).toFixed(3, 1)
      } else {
        return this.item.balance
      }
    }
  },
  methods: {
  }
}
</script>
