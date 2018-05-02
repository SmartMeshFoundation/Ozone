<template>
  <div>
    <h1 class="trans-title"> {{$t('tx.list.caption')}} </h1>
    <q-list highlight
            no-border
            striped-odd
            sparse
            class="q-mt-lg transaction">
      <q-list-header v-if="items.length === 0"> {{$t('tx.text.noTxs')}} </q-list-header>
      <transaction-item v-for="item of items" :key="item.hash" :item="item" />
    </q-list>
  </div>
</template>

<style lang="stylus">
div.transaction img.q-item-avatar
    width 24px
    height 24px
    vertical-align middle
h1.trans-title
    font-weight bold
    color #333333
    font-size 16px
    line-height 22px
    padding 13px 0px
    border-bottom 1px solid #DEE3E7 !important
</style>

<script>

export default {
  name: 'TransactionList',
  props: {
    items: {
      required: true
    }
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
