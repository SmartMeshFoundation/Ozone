<template>
  <q-page class="q-pa-lg">
    <account-list />
    <br>
    <transaction-list :items="txList" />
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
  computed: {
    txList () {
      return this.$store.state.transaction.list
    }
  },
  methods: {},
  created () {
    // pass data to parent component
    this.$emit('updateToolbar', this.$t('nav.wallet.label'), 'fa-credit-card')

    // restore vue store
    ipcRenderer.send(Types.RESTORE_STATE)
  }
}
</script>
