<template>
  <q-page class="q-pa-lg wallet">
    <account-list />
    <br>
    <transaction-list :items="txList" />
  </q-page>
</template>

<style lang="stylus">
.wallet .trans-title
    margin-top 8px
</style>

<script>
// import { ipcRenderer as ipc } from 'electron'
// import { Types } from '../../src-electron/modules/ipc/types'

export default {
  data () {
    return {
    }
  },
  computed: {
    txList () {
      // let accounts = this.$store.state.account.list.map(account => {
      //   return account.address.toLowerCase()
      // })
      return this.$store.state.transaction.list
      // return this.$store.state.transaction.list.filter((item) => {
      //   let from = item.from.toLowerCase()
      //   let to = item.to.toLowerCase()
      //   return accounts.indexOf(from) !== -1 || accounts.indexOf(to) !== -1
      // })
    }
  },
  created () {
    // pass data to parent component
    this.$emit('updateToolbar', this.$t('nav.wallet.label'), 'fa-credit-card')

    // ipc.send(Types.SYNC_ALL_STATE)
  }
}
</script>
