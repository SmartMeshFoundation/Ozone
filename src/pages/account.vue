<template>
  <q-page class="q-pa-lg account-item">
    <h1 class="account-name">
      <em class="float-right text-warning">{{ $t('account.balance') }}: <ani-number :value="account.ether" /> </em>
      <ident-icon :value="account.address.toLowerCase()"
                  class="vertical-middle q-pa-xs" /> {{ account.name }}
      <div class="changename-btn" @click.stop="changeName"></div>
      <div class="backup-btn" @click.stop="backup(account.address)">{{$t('account.btn.backupAccount')}}</div>
      <br/>
      <small class="account-address">{{ account.address }}</small>
    </h1>
    <br/>

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
.account-trans
    width 120px
    height 36px
    font-size 14px !important
    background-color #4782F6  !important
    margin-left 16px
    border-radius 4px
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
  border-radius 4px
  width 70px
  height 36px
  background-color #4782F6 !important
div.modify-modal .cancel-btn
  bottom 4px
  right 105px !important
div.modify-modal .sub-btn
  bottom 4px
  right 26px !important
div.changename-btn
  display inline-block
  vertical-align middle
  width 30px
  height 30px
  background url("../assets/edit@2x.png") no-repeat center !important
  background-size cover
  margin-left 10px
  cursor pointer
div.backup-btn
  display inline-block
  border-radius 100px
  background-color #4782F6
  width 45px
  height 20px
  font-size 12px
  color #FFFFFF
  text-align center
  line-height 20px
  cursor pointer
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
  },

  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        { key: 'nav.wallet.label', to: '/wallet' },
        { key: 'nav.wallet.account' }
      ]
    })
  }
}
</script>
