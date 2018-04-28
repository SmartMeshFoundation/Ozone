<template>
  <div class="account-item">
    <q-item :to="to">
      <q-item-side>
        <ident-icon :value="account.address.toLowerCase()" />
      </q-item-side>
      <q-item-main>
        <q-item-tile>
          <strong class="account-name">{{account.name}}</strong>
        </q-item-tile>
        <q-item-tile class="address">{{account.address}}
          <q-icon name="content_copy"
                  @click.native.stop="copyAddress(account.address)" /> </q-item-tile>
      </q-item-main>
      <q-item-side right>
        <q-item-tile class="balance-title">余额</q-item-tile>
        <q-item-tile class="balance-value">
          <ani-number :value="account.ether" /> </q-item-tile>
      </q-item-side>
    </q-item>
    <q-modal class="verify-modal" v-model="showVerifyModal">
      <div class="q-pa-md">
        <p class="q-headline">警告：拷贝地址</p>
        <p class="text-1">你同意拷贝账户地址到系统剪切板吗？</p>
        <q-btn label="确定"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>
  </div>
</template>
<style lang="stylus">
div.account-item
    height 80px
    margin-top:10px
div.account-item:nth-child(2n)
    background-color #F9FEFF
div.account-item:nth-child(2n-1)
    background-color #FFFFFF
div.account-item .q-item-link{
    height 80px
}
div.address
    color #999999
    font-size 14px
    padding 5px 0px
strong.account-name
    font-size 16px
    line-height 22px
div.balance-title
    font-size 16px
    color #999999
    line-height 22px
div.balance-value
    font-size 14px
    color #999999
    line-height 20px
    padding 5px 0px
div.verify-modal .modal-content
    width 448px
    height 214px
div.verify-modal .q-headline
    font-size 18px
    color #333333
    line-height 25px
    margin-top 14px
    margin-left 8px
div.verify-modal .text-1
    font-size 16px
    color #999999
    line-height 22px
    margin-top 6px
    margin-left 8px
div.verify-modal .q-btn
    position absolute
    right 26px
    bottom 4px
    border-radius 2px
    width 70px
    height 36px
    background-color #10A0F8 !important
</style>
<script>
import copy from 'clipboard-copy'

export default {
  name: 'AccountItem',
  data () {
    return {
      showVerifyModal: false,
      copy_Address: ''
    }
  },
  props: {
    account: {
      required: true
    },
    to: {
      type: String
    }
  },
  methods: {
    copyAddress (address) {
      this.showVerifyModal = true
      this.copy_Address = address
    },
    submit () {
      copy(this.copy_Address).then(() => {
        this.showVerifyModal = false
        this.$q.notify({ message: '拷贝地址成功！', color: 'primary' })
      })
    }
  }
}
</script>
