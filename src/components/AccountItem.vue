<template>
  <div class="account-item">
    <q-item :to="to">
      <q-item-side>
        <ident-icon :value="account.address.toLowerCase()" />
      </q-item-side>
      <q-item-main>
        <q-item-tile>
          <strong class="account-name-title">{{account.name}}</strong>
        </q-item-tile>
        <q-item-tile class="address">{{account.address}}
          <q-icon name="content_copy"
                  @click.native.stop="copyAddress(account.address)" /> <div class="qr_code" @click.stop="qrcode(account.address)"></div></q-item-tile>
      </q-item-main>
      <q-item-side right>
        <q-item-tile class="balance-title">{{ $t('account.balance') }}</q-item-tile>
        <q-item-tile class="balance-value">
          <ani-number :value="account.ether" /> </q-item-tile>
      </q-item-side>
    </q-item>
    <q-modal class="verify-modal" v-model="showVerifyModal">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('account.copy.alert') }}</p>
        <p class="text-1">{{ $t('account.copy.content') }}</p>
        <q-btn :label="$t('button.ok')"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>

    <q-modal class="qr-modal" v-model="showQrModal">
      <div class="q-pa-md">
        <img v-bind:src="qrdata" class="img-circle" ref="qrcodeImage" width="100%" height="100%"/>
      </div>
    </q-modal>
  </div>
</template>
<style lang="stylus">
div.account-item
    height 80px
    margin-top:10px
    background-color #FFFFFF
    border-radius 2px
div.account-item .q-item-link
    height 80px
div.account-item .q-item-link:hover
    background: #F9FEFF !important
div.address
    color #999999
    font-size 14px
    padding 5px 0px
strong.account-name-title
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
.q-alert-content
    background-color #10A0F8 !important
div.qr_code
    display inline-block
    vertical-align middle
    width 15px
    height 15px
    background url("../assets/qr.png") no-repeat center !important
    background-size cover
</style>
<script>
import copy from 'clipboard-copy'
const qrCode = require('qrcode')
export default {
  name: 'AccountItem',
  data () {
    return {
      showVerifyModal: false,
      showQrModal: false,
      copy_Address: '',
      qrdata: ''
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
        this.$q.notify({ message: this.$t('account.copy.success'), color: 'primary', timeout: 1000 })
      })
    },
    qrcode (address) {
      this.showQrModal = true
      qrCode.toDataURL(address, {version: 5}).then(url => {
        console.log(url)
        this.qrdata = url
      })
    }
  }
}
</script>
