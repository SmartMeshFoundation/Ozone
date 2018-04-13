<template>
  <q-page class="q-pa-lg">
    <account-list />
    <br>
    <transaction-list />
  </q-page>
</template>

<style>

</style>

<script>
import { ipcRenderer } from 'electron'
import { Types } from '../../src-electron/lib/channel/types'

export default {
  name: 'PageWallet',
  data () {
    return {
    }
  },
  computed: {},
  methods: {},
  created () {
    // 向父组件发消息
    this.$emit('updateToolbar', '钱包', 'fa-credit-card')

    // restore vue store
    ipcRenderer.send(Types.RESTORE_STATE)
  }
}
</script>
