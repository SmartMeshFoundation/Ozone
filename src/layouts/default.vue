<template>
  <q-layout view="LHh Lpr LFf">
    <q-layout-header style="-webkit-app-region: drag">
      <q-toolbar :glossy="$q.theme === 'mat'"
                 :inverted="$q.theme === 'ios'">

        <q-btn class="toolbar-btn"
               flat
               dense
               round
               @click="leftDrawerOpen = !leftDrawerOpen"
               aria-label="Menu"
               icon="menu" />

        <q-breadcrumbs class="q-ml-xs" color="light">
          <q-breadcrumbs-el v-for="item in breadcrumbs" :key="item.key" :label="$t(item.key)" :to="item.to"/>
        </q-breadcrumbs>

      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer v-model="leftDrawerOpen"
                     :content-class="$q.theme === 'mat' ? 'bg-grey-2 shadow-5' : null">
      <div class="bg-white">
        <div class="row flex-center q-my-sm">
          <img alt="Ozone logo"
               src="statics/ozone-logo@1x.png"
               class="ozone-img" />
          <q-chip dense
                  floating
                  :class="{hidden: !isTestNet}"
                  color="negative"> test net </q-chip>
          <q-chip dense
                  floating
                  :class="{hidden: !isPrivateNet}"
                  color="negative"> private net </q-chip>
        </div>
        <!--<div class="row q-pa-sm justify-center">
          <lang-switcher />
        </div>-->
      </div>
      <q-list class="ozone-menu" no-border
              link
              inset-delimiter>
        <q-list-header>{{ $t('nav.header.account') }}</q-list-header>

        <q-item to="/wallet">
          <q-item-side class="wallet-menu" />
          <q-item-main :label="$t('nav.wallet.label')"
                       :sublabel="$t('nav.wallet.sublabel')" />
        </q-item>

        <q-item to="/transfer/">
          <q-item-side class="trans-menu" />
          <q-item-main :label="$t('nav.transfer.label')"
                       :sublabel="$t('nav.transfer.sublabel')" />
        </q-item>

        <q-list-header>{{ $t('nav.header.contract') }}</q-list-header>

        <q-item to="/contract/deploy">
          <q-item-side class="deploy-menu" />
          <q-item-main :label="$t('nav.contract.deploy.label')"
                       :sublabel="$t('nav.contract.deploy.sublabel')" />
        </q-item>

        <q-item to="/contract/my">
          <q-item-side class="contract-menu" />
          <q-item-main :label="$t('nav.contract.my.label')"
                       :sublabel="$t('nav.contract.my.sublabel')" />
        </q-item>
      </q-list>
      <div class="row q-pa-sm justify-center blockinfo">
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
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<style lang="stylus">
.ozone-img
    position fixed
    top 30px
    left 14px
    margin-bottom 30px
    height 40px
    width 122px
.toolbar-title
    font-size 16px
    color #788083 !important
.toolbar-btn
    color: #cccccc
.q-layout-drawer
    width: 298px
.blockinfo
    position absolute
    bottom 20px
    left 60px
.q-layout-page
    background-color: #F1F3F6
div.ozone-menu
    margin-top:75px
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
    background url("../assets/wallet@1x.png") no-repeat center
div.trans-menu
    background url("../assets/trans@1x.png") no-repeat center
div.deploy-menu
    background url("../assets/deploy@1x.png") no-repeat center
div.contract-menu
    background url("../assets/contract@1x.png") no-repeat center

</style>
<script>
let timer
const web3 = window.web3

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
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
    },
    breadcrumbs () {
      return this.$store.state.ui.breadcrumbs
    }
  },
  watch: {
    blockNumber: function () {
      this.elapsedTime = 0
    }
  },
  methods: {

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
