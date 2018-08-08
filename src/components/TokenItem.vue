<template>
    <div class="col-4">
      <q-item class="token-item">
        <q-item-side>
          <ident-icon :value="item.contractAddress" />
        </q-item-side>
        <q-item-main>
          <q-item-tile>{{item.tokenName}}</q-item-tile>
          <q-item-tile>{{item.tokenSymbol}}</q-item-tile>
          <q-item-tile>{{contractAddress}}</q-item-tile>
        </q-item-main>
        <i class="token-select" v-bind:class="{ 'token-selected': checked }" @click.stop="checkToken(item)"></i>
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
.token-item .q-item-main div:nth-child(2)
  color #666666
  font-size 12px
  line-height 17px
.token-item .q-item-main div:nth-child(3)
  color #999999
  font-size 12px
  line-height 17px
.token-select
  width 22px
  height 22px
  background url("../assets/select@1x.png") no-repeat center
  z-index 1000
  display block
  position relative
  left 27px
  bottom  38px
  cursor pointer
.token-selected
  background url("../assets/selected@1x.png") no-repeat center !important
</style>

<script>

export default {
  data () {
    return {
      checked: this.item['checked']
    }
  },
  props: {
    item: {
      required: true
    }
  },
  computed: {
    contractAddress () {
      if (this.item.contractAddress) {
        return this.item.contractAddress.substr(0, 10) + '...' + this.item.contractAddress.substr(this.item.contractAddress.length - 10, this.item.contractAddress - 1)
      } else {
        return 'Pending ...'
      }
    }
  },
  methods: {
    checkToken (item) {
      if (this.checked) {
        this.$emit('checked', false, item.contractAddress)
        this.checked = false
      } else {
        this.$emit('checked', true, item.contractAddress)
        this.checked = true
      }
    }
  }
}
</script>
