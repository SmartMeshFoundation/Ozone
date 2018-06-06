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

    ipc.on(Types.SYNC_CONTRACT, (event, { contracts }) => {
      this.$store.commit('contract/reset', contracts)
    })

    ipc.on(Types.NODE_STATE_CHANGE, (event, state) => {
      this.$store.commit('node/update', state)
    })

    ipc.on(Types.SWITCH_LAN, (event, lang) => {
      let iLocale, mLocale, qLang
      if (lang === 'zh') {
        qLang = 'zh-hans'
        iLocale = 'zh'
        mLocale = 'zh-cn'
      } else {
        qLang = 'en-us'
        iLocale = 'en'
        mLocale = 'en'
      }

      this.$i18n.locale = iLocale
      this.$moment.locale(mLocale)

      // i18n for quasar-framework
      import(`quasar-framework/i18n/${qLang}`).then(lang => {
        this.$q.i18n.set(lang.default)
      })
    })
  },
  destroyed () {
    [
      Types.SYNC_ACCOUNT,
      Types.SYNC_TRANSACTION,
      Types.NODE_STATE_CHANGE,
      Types.SWITCH_LAN,
      Types.SYNC_CONTRACT
    ].forEach(channel => {
      ipc.removeAllListeners(channel)
    })
  }
}
</script>

<style>
</style>
