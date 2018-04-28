<template>
  <q-page class="q-pa-lg account-item">
    <h1 class="account-name">
      <em class="float-right text-warning">{{ $t('account.balance') }}: <ani-number :value="account.ether" /> </em>
      <ident-icon :value="account.address.toLowerCase()"
                  class="vertical-middle q-pa-xs" /> {{ account.name }}
      <q-btn class="account-edit"
             dense
             round
             color="grey-4"
             @click="changeName" />
      <br/>
      <small class="account-address">{{ account.address }}</small>
    </h1>
    <br/>
    <q-btn class="account-save" size="lg"
           color="primary"
           :label="$t('account.btn.backupAccount')"
           @click="backup(account.address)" />

    <q-btn class="account-trans" size="lg"
           color="primary"
           :label="$t('account.btn.transfer')"
           @click="$router.push('/transfer/account/' + account.address)" />

    <br><br>

    <transaction-list :items="txList" />

  </q-page>
</template>

<style lang="stylus">
.account-name
    font-size 18px !important
    font-weight bold
    color #333333 !important
    line-height 25px !important
.account-name .text-warning
    color #FFBB44 !important
    font-size 17px
    line-height 35px
.account-address
    font-size 16px !important
    color #999999 !important
    font-weight normal !important
    line-height 22px !important
    margin-top 15px
.account-edit
    width 30px !important
    height 30px !important
    background url("../assets/edit@2x.png") no-repeat center !important
    margin-left 21px
.account-save
    width 120px
    font-size 14px !important
    background-color #74CC47 !important
    border-radius 2px
    height 36px
.account-trans
    width 120px
    height 36px
    font-size 14px !important
    background-color #10A0F8  !important
    margin-left 16px
    border-radius 2px
.account-item .trans-title
    margin-top 180px
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
    },
    txList () {
      let address = this.$route.params.address.toLowerCase()
      return this.$store.state.transaction.list.filter((item) => {
        let from = item.from.toLowerCase()
        let to = item.to.toLowerCase()
        return from === address || to === address
      })
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
      let keystore = path.join(this.$settings.chainDataPath, 'keystore')
      shell.showItemInFolder(keystore)
    }
  }
}
</script>
