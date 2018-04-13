<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import {ipcRenderer} from 'electron'

const channels = [
  'restore-account',
  'restore-transaction'
]

export default {
  name: 'App',
  created () {
    channels.forEach(channel => {
      ipcRenderer.removeAllListeners(channel)
    })

    ipcRenderer.on('restore-account', (event, { accounts }) => {
      // console.log('restore accounts: ', accounts)
      this.$store.commit('account/reset', accounts)
    })

    ipcRenderer.on('restore-transaction', (event, { transactions }) => {
      // console.log('restore transactions: ', transactions)
      this.$store.commit('transaction/reset', transactions)
    })
  }
}
</script>

<style>
</style>
