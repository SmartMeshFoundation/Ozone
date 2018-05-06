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

    ipc.on(Types.SWICH_LAN, (event, lang) => {
      if (lang === 'zh') {
        lang = 'zh-hans'
        this.$i18n.locale = 'zh'
        // moment 组件国际化
        this.$moment.locale('zh-cn')
      } else {
        lang = 'en-us'
        this.$i18n.locale = 'en'
        this.$moment.locale('en')
      }

      // 切换quasar-framework的语言
      import(`quasar-framework/i18n/${lang}`).then(lang => {
        this.$q.i18n.set(lang.default)
      })
    })
  },
  destroyed () {
    [
      Types.SYNC_ACCOUNT,
      Types.SYNC_TRANSACTION,
      Types.NODE_STATE_CHANGE,
      Types.SWICH_LAN
    ].forEach(channel => {
      ipc.removeAllListeners(channel)
    })
  }
}
</script>

<style>
</style>
