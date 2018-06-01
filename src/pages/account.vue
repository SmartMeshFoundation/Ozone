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

    <q-modal class="modify-modal" v-model="showModifyModal">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('account.mondify_name') }}</p>
        <p class="modify-account-name"><q-input v-model="modifyAccountName"/></p>
        <q-btn :label="$t('button.cancel')"
               color="primary"
               class="q-my-md cancel-btn"
               @click="cancel" />
        <q-btn :label="$t('button.ok')"
               color="primary"
               class="q-my-md sub-btn"
               @click="submit" />
      </div>
    </q-modal>

  </q-page>
</template>

<style lang="stylus">
.account-name
    font-size 18px !important
    font-weight bold
    color #333333 !important
    line-height 25px !important
    border-bottom 1px solid #DEE3E7 !important
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
    margin-top 60px
div.modify-modal .modal-content
  width 448px
  height 214px
div.modify-modal .q-headline
  font-size 18px
  color #333333
  line-height 25px
  margin-top 14px
  margin-left 8px
div.modify-modal .modify-account-name
  margin-top 30px !important
div.modify-modal .q-btn
  position absolute
  border-radius 2px
  width 70px
  height 36px
  background-color #10A0F8 !important
div.modify-modal .cancel-btn
  bottom 4px
  right 105px !important
div.modify-modal .sub-btn
  bottom 4px
  right 26px !important
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
      showModifyModal: false,
      modifyAccountName: '',
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
        let to = !item.to ? 'NULL' : item.to.toLowerCase()
        return from === address || to === address
      })
    }
  },
  methods: {
    changeName () {
      const account = this.account
      this.modifyAccountName = account.name
      this.showModifyModal = true
    },
    backup (address) {
      let keystore = path.join(this.$settings.chainDataPath, 'keystore')
      shell.showItemInFolder(keystore)
    },
    cancel () {
      this.showModifyModal = false
      this.modifyAccountName = ''
    },
    submit () {
      let input = this.modifyAccountName
      console.log('You typed: ', input)
      if (input.length > 0 && input.trim() !== this.account.name) {
        this.$store.commit('account/updateAccountName', {
          address: this.account.address,
          name: input
        })
        this.showModifyModal = false
      }
    }
  }
}
</script>
