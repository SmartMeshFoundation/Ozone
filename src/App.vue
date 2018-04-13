<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import { Types } from '../src-electron/lib/channel/types'

export default {
  name: 'App',
  beforeCreate () {
    ipcRenderer.on(Types.RESTORE_ACCOUNT, (event, { accounts }) => {
      // console.log('restore accounts: ', accounts)
      this.$store.commit('account/reset', accounts)
    })

    ipcRenderer.on(Types.RESTORE_TRANSACTION, (event, { transactions }) => {
      // console.log('restore transactions: ', transactions)
      this.$store.commit('transaction/reset', transactions)
    })
  }
}
</script>

<style>
</style>
