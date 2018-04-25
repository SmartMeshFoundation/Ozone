<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import {ipcRenderer as ipc} from 'electron'
import { Types } from '../src-electron/modules/ipc/types'

export default {
  name: 'App',
  beforeCreate () {
    ipc.on(Types.SYNC_ACCOUNT, (event, { accounts }) => {
      // console.log('restore accounts: ', accounts)
      this.$store.commit('account/reset', accounts)
    })

    ipc.on(Types.SYNC_TRANSACTION, (event, { transactions }) => {
      // console.log('restore transactions: ', transactions)
      this.$store.commit('transaction/reset', transactions)
    })

    ipc.on(Types.NODE_STATE_CHANGE, (event, state) => {
      this.$store.commit('node/update', state)
    })
  },
  destroyed () {
    [
      Types.SYNC_ACCOUNT,
      Types.SYNC_TRANSACTION,
      Types.NODE_STATE_CHANGE
    ].forEach(channel => {
      ipc.removeAllListeners(channel)
    })
  }
}
</script>

<style>
</style>
