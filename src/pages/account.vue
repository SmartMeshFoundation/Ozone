<template>
  <q-page class="q-pa-lg">
    <h1>
      <em class="float-right text-warning">{{ $t('account.balance') }}: <ani-number :value="account.ether" /> </em>
      <ident-icon :value="account.address.toLowerCase()"
                  class="vertical-middle q-pa-xs" /> {{ account.name }}
      <q-btn flat
             dense
             round
             color="grey-4"
             icon="fa-edit"
             @click="changeName" />
      <small>{{ account.address }}</small>
    </h1>
    <br/>
    <br/>
    <q-btn flat
           color="secondary"
           icon="fa-exchange-alt"
           :label="$t('account.btn.transfer')"
           @click="$router.push('/transfer/account/' + account.address)" />

    <q-btn flat
           color="secondary"
           icon="fa-save"
           :label="$t('account.btn.backupAccount')"
           @click="backup(account.address)">
    </q-btn>

    <br><br>

    <h1>交易历史</h1>
    <q-list highlight
            inset-separator
            no-border
            class="q-mt-lg">
      <q-list-header v-if="trans.length == 0">暂时还没有最近的历史交易</q-list-header>
    </q-list>
  </q-page>
</template>

<style>

</style>

<script>
import { shell } from 'electron'
// const { app, dialog } = remote
// import fs from 'fs-extra'
import path from 'path'

export default {
  name: 'PageAccount',
  data () {
    return {
      trans: []
    }
  },
  computed: {
    account () {
      return this.$store.getters['account/get'](this.$route.params.address)
    }
  },
  methods: {
    changeName () {
      const account = this.account
      this.$q
        .dialog({
          title: '修改账户名称',
          // message: 'You are about to run out of disk space.',

          // optional
          color: 'primary',

          // optional; we want an "OK" button
          ok: this.$t('button.ok'), // takes i18n value, or String for "OK" button label

          // optional; we want a "Cancel" button
          cancel: this.$t('button.cancel'), // takes i18n value, or String for "Cancel" button label

          // optional; prevent user dismissal when not clicking on a Dialog button
          preventClose: true,

          noBackdropDismiss: false, // gets set to "true" automatically if preventClose is "true"
          noEscDismiss: false, // gets set to "true" automatically if preventClose is "true"

          // optional; stacks button vertically instead of horizontally (default)

          // optional; a position of the Dialog (top, bottom, left, right)
          position: 'top',

          // optional; show an input box (make Dialog similar to a JS prompt)
          prompt: {
            model: account.name,
            type: 'text' // optional
          }
        })
        .then(input => {
          console.log('You typed: ', input)
          if (input.length > 0 && input.trim() !== this.account.name) {
            this.$store.commit('account/updateAccountName', {
              address: this.account.address,
              name: input
            })
          }
        })
        .catch(error => {
          console.log(error)
          console.log('You canceled!')
        })
    },
    backup (address) {
      address = address.replace('0x', '')
      address = address.toLowerCase()
      let keystore = path.join(this.$setting.chainDataPath, 'keystore')
      shell.showItemInFolder(keystore)
    }
  }
}
</script>
