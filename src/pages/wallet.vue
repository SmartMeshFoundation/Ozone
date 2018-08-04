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
      return this.$store.state.transaction.list
    }
  },
  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        {key: 'nav.wallet.label', to: '/wallet'}
      ]
    })
    if (this.lock === null) {

    }
    // ipc.send(Types.SYNC_ALL_STATE)
  }
}
</script>
