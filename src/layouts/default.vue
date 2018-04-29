<template>
  <q-layout view="LHh Lpr LFf">
    <q-layout-header style="-webkit-app-region: drag">
      <q-toolbar :glossy="$q.theme === 'mat'"
                 :inverted="$q.theme === 'ios'">
        <q-toolbar-title>
          <span class="toolbar-title">{{ toolbarTitle }}</span>
          <!-- <div slot="subtitle">Impossible made possible</div> -->
        </q-toolbar-title>
        <q-btn class="toolbar-btn" flat
               dense
               round
               @click="leftDrawerOpen = !leftDrawerOpen"
               aria-label="Menu"
               icon="menu" />

      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer v-model="leftDrawerOpen"
                     :content-class="$q.theme === 'mat' ? 'bg-grey-2 shadow-5' : null">
      <div class="bg-white">
        <div class="row flex-center q-my-sm">
          <img alt="Ozone logo"
               src="statics/icon_smart.png"
               class="ozone-img" />
          <q-btn class="ozone-logo" flat
                 dense
                 disable
                 text-color="black"
                 size="xl"
                 label="OZONE">
          <q-chip dense
                  floating
                  :class="{hidden: !isTestNet}"
                  color="negative"> test net </q-chip>
          <q-chip dense
                  floating
                  :class="{hidden: !isPrivateNet}"
                  color="negative"> private net </q-chip>
          </q-btn>
        </div>
        <div class="row q-pa-sm justify-center">
          <q-chip dense
                  icon="layers"
                  title="block number"
                  class=""> {{blockNumber}} </q-chip>
          <q-chip dense
                  icon="timer"
                  title="elapsed time"
                  class="q-ml-sm"> {{elapsedTime}} s</q-chip>
          <q-chip dense
                  icon="router"
                  title="peers"
                  class="q-ml-sm"> {{peerCount}} </q-chip>
        </div>
        <div class="row q-pa-sm justify-center">
          <lang-switcher />
        </div>
      </div>
      <q-list class="ozone-menu" no-border
              link
              inset-delimiter>
        <q-list-header>{{ $t('nav.header.account') }}</q-list-header>
        <q-item to="/wallet"
                @click.native="updateToolbar($t('nav.wallet.label'), 'fa-credit-card')">
          <q-item-side class="wallet-menu" />
          <q-item-main :label="$t('nav.wallet.label')"
                       :sublabel="$t('nav.wallet.sublabel')" />
        </q-item>
        <q-item to="/transfer/"
                @click.native="updateToolbar($t('nav.transfer.label'), 'fa-exchange-alt')">
          <q-item-side class="trans-menu" />
          <q-item-main :label="$t('nav.transfer.label')"
                       :sublabel="$t('nav.transfer.sublabel')" />
        </q-item>
        <!--<q-list-header>{{ $t('nav.header.contract') }}</q-list-header>
        <q-item to="/deployContract">
          <q-item-side icon="code" />
          <q-item-main :label="$t('nav.deploy_contract.label')"
                       :sublabel="$t('nav.deploy_contract.sublabel')" />
        </q-item>-->
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<style lang="stylus">
.ozone-img
    margin-top 18px
    height 50px
    width 50px
.ozone-logo
    margin-top 18px
    color #333333
    font-size 22px
    line-height 30px
.toolbar-title
    position absolute
    left 27px
    line-height 22px
    top 14px
    font-size 16px
    color #788083 !important
.toolbar-btn
    color: #cccccc
.q-layout-drawer
    width: 298px
.q-layout-page
    background-color: #F1F3F6
div.ozone-menu > .q-item.router-link-active
    background-color #F4F8F9
    border-left 3px solid #10A0F8 !important
.q-item:after
    visibility hidden
.q-list-header
    color #868686
    font-size 14px
    line-height 20px
div.q-item-label
    color #333333
    font-size 15px
    line-height 21px
div.q-item-sublabel
    color #999999
    font-size 14px
    line-height 20px
div.ozone-menu .q-item
    height 62px
div.ozone-menu .q-item-main
    position fixed
    left 62px
div.ozone-menu .q-item-side
    display inline-block
    position fixed
    left 19px
    width 30px
    height 30px
div.wallet-menu
    background url("../assets/wallet@2x.png") no-repeat center
div.trans-menu
    background url("../assets/trans@2x.png") no-repeat center
.modal-content
    border-radius 2px
.q-alert-content
    font-size 16px
    color: #FFFFFF
    background-color #10A0F8
    border-radius 2px
    width 141px
    height 44px
</style>
<script>
let timer
const web3 = window.web3

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      toolbarTitle: 'Ozone',
      toolbarIcon: 'layers',
      elapsedTime: 0,
      isTestNet: false,
      isPrivateNet: false
    }
  },
  computed: {
    blockNumber () {
      return this.$store.state.node.blockNumber
    },
    peerCount () {
      return this.$store.state.node.peers
    }
  },
  watch: {
    blockNumber: function () {
      this.elapsedTime = 0
    }
  },
  methods: {
    updateToolbar (title, icon) {
      this.toolbarTitle = title
      this.toolbarIcon = icon
    }
  },
  created () {
    let $vm = this
    timer = setInterval(() => {
      $vm.elapsedTime += 1
    }, 1000)

    web3.eth.net.getId().then(num => {
      if (num === 3) {
        this.isTestNet = true
      } else if (num !== 1 && num !== 19840711) {
        this.isPrivateNet = true
      }
    })
  },
  destroyed () {
    clearInterval(timer)
  }
}
</script>
