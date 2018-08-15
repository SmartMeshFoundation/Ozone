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

        <q-breadcrumbs class="q-ml-xs ozone-breadcrumbs" color="light">
          <q-breadcrumbs-el v-for="item in breadcrumbs" :key="item.key" :label="$t(item.key)" :to="item.to"/>
        </q-breadcrumbs>

      </q-toolbar>
      <div class="row q-pa-sm justify-center blockinfo">
        <div class="setting-btn" @click.stop="showMenuPop=true">
          <q-popover class="ozone-popup" v-model="showMenuPop"
                     anchor="bottom left"
                     self="top left"
                     :offset="[23,5]"
          >
            <div class="lock-menu" @click.stop="setting">{{ $t('lock.menu') }}</div>
          </q-popover>
        </div>
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
    </q-layout-header>

    <q-layout-drawer v-model="leftDrawerOpen"
                     :content-class="$q.theme === 'mat' ? 'bg-grey-2 shadow-5' : null">
      <q-list class="ozone-menu" no-border
              link
              inset-delimiter>
        <!--<q-list-header>{{ $t('nav.header.account') }}</q-list-header>-->

        <q-item to="/wallet">
          <q-item-side class="wallet-menu" />
          <q-tooltip class="ozone-menu-tip" anchor="center right" self="center left" :offset="[10, 10]">
            {{$t('nav.wallet.sublabel')}}
          </q-tooltip>
        </q-item>
        <div class="menu-label">{{$t('nav.wallet.label')}}</div>

        <q-item to="/transfer/">
          <q-item-side class="trans-menu" />
          <q-tooltip class="ozone-menu-tip" anchor="center right" self="center left" :offset="[10, 10]">
            {{$t('nav.transfer.sublabel')}}
          </q-tooltip>
        </q-item>
        <div class="menu-label">{{$t('nav.transfer.label')}}</div>

        <!--<q-list-header>{{ $t('nav.header.contract') }}</q-list-header>-->

        <q-item to="/contract/deploy">
          <q-item-side class="deploy-menu" />
          <q-tooltip class="ozone-menu-tip" anchor="center right" self="center left" :offset="[10, 10]">
            {{$t('nav.contract.deploy.sublabel')}}
          </q-tooltip>
        </q-item>
        <div class="menu-label">{{$t('nav.contract.deploy.label')}}</div>

        <q-item to="/contract/my">
          <q-item-side class="contract-menu" />
          <q-tooltip class="ozone-menu-tip" anchor="center right" self="center left" :offset="[10, 10]">
            {{$t('nav.contract.my.sublabel')}}
          </q-tooltip>
        </q-item>
        <div class="menu-label">{{$t('nav.contract.my.label')}}</div>
      </q-list>
      <div class="ozone-logo">
        <img alt="Ozone logo"
             src="statics/ozone-logo@2x.png"
             class="ozone-img" width="30" height="30"/>
        <div class="logo-label">Ozone</div>
      </div>
    </q-layout-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-modal class="lock-modal" v-model="showLockModal"
             @hide="reset">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('lock.title') }}</p>
        <q-field>
          <q-input :float-label="$t('lock.password_msg1')"
                   :autofocus="showLockModal"
                   type="password"
                   v-model="lockForm.password"
                    />
        </q-field>

        <q-field>
          <q-input :float-label="$t('lock.password_msg2')"
                   type="password"
                   v-model="lockForm.repeatPassword"
                    />
        </q-field>

        <q-btn :label="$t('button.ok')"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>
    <q-modal class="lock-modal lock-modify-modal" v-model="showLockModidyModal"
             @hide="reset">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('lock.title') }}</p>
        <p><span class="lock-tools-title">{{ $t('lock.modify.open') }}</span><span class="lock-tools-btn"><q-toggle v-model="checked" @input="updateState"/></span></p>
        <q-collapsible :label="$t('lock.modify.modify_pwd')">
          <q-field>
            <q-input :float-label="$t('lock.modify.password_msg1')"
                     type="password"
                     v-model="lockForm.oldpassword"
            />
          </q-field>

          <q-field>
            <q-input :float-label="$t('lock.modify.password_msg2')"
                     type="password"
                     v-model="lockForm.password"
            />
          </q-field>

          <q-field>
            <q-input :float-label="$t('lock.modify.password_msg3')"
                     type="password"
                     v-model="lockForm.repeatPassword"
            />
          </q-field>
        </q-collapsible>

        <q-btn :label="$t('button.ok')"
               color="primary"
               class="float-right q-my-md"
               @click="modify" />
      </div>
    </q-modal>
  </q-layout>
</template>
<style lang="stylus">
.toolbar-title
    font-size 16px
    color #788083 !important
.toolbar-btn
    color: #4782F6
.q-layout-drawer
    width: 4.375em
    overflow-x hidden
.blockinfo
    position absolute
    top 7px
    right  19px
.q-layout-page
    background-color: #F1F3F6
.q-item:after
    visibility hidden
.q-list-header
    color #868686
    font-size 14px
    line-height 20px
div.q-drawer-container
    width 4.375em !important
div.ozone-menu
  margin-top:50px
div.ozone-menu > .q-item.router-link-active
  background none
div.ozone-menu > .q-item.router-link-active > .wallet-menu
  background url("../assets/wallet-active@1x.png") no-repeat center
div.ozone-menu > .q-item.router-link-active > .trans-menu
  background url("../assets/trans-active@1x.png") no-repeat center
div.ozone-menu > .q-item.router-link-active > .deploy-menu
  background url("../assets/deploy-active@1x.png") no-repeat center
div.ozone-menu > .q-item.router-link-active > .contract-menu
  background url("../assets/contract-active@1x.png") no-repeat center
div.ozone-menu > .q-item-link:hover, q-item-link:hover
  background none !important
div.ozone-menu .menu-label
    color #323232 !important
    font-size 12px
    text-align center
    line-height 17px
    padding-bottom 7px
div.ozone-menu .q-item-sublabel
  color #999999
  font-size 14px
  line-height 20px
div.ozone-menu .q-item-side
    width 32px
    height 32px
div.wallet-menu
    background url("../assets/wallet@1x.png") no-repeat center
div.trans-menu
    background url("../assets/trans@1x.png") no-repeat center
div.deploy-menu
    background url("../assets/deploy@1x.png") no-repeat center
div.contract-menu
    background url("../assets/contract@1x.png") no-repeat center
div.ozone-logo
    position absolute
    bottom 15px
    width 70px
    z-index 1000
    text-align center
div.ozone-logo .logo-label
    font-size 12.8px
    color #4782F6
    line-height 18px
div.ozone-breadcrumbs .text-primary
    color #4782F6 !important
div.setting-btn
  margin-right 10px
  width 16px
  height 16px
  background url("../assets/setting@1x.png") no-repeat center !important
  background-size cover
  margin-left 12px
  cursor pointer
.ozone-menu-tip
  background-color #000000 !important
  font-size 12px
  line-height 17px
  color #ffffff
  border-radius 6px
  margin-left -20px
  box-shadow none !important
.ozone-popup
  background-color #000000 !important
  border-radius 6px
  vertical-align middle
.ozone-popup .lock-menu
  font-size 12px
  line-height 17px
  color #ffffff
  cursor pointer
  width 62px
  height 33px
  padding-top 8px
  text-align center
div.lock-modify-modal .modal-content
  height auto !important
div.lock-modify-modal .lock-tools-title
  color #323232
  font-size 15px !important
  line-height 21px
div.lock-modify-modal .lock-tools-btn
  float right
div.lock-modal .modal-content
  border-radius 6px !important
  width 422px
  height 220px
div.lock-modal .q-headline
  color #333333 !important
  font-size 18px
  line-height 25px
div.lock-modal .text-1
  color #999999
  font-size 16px
  line-height 22px
div.lock-modal .q-btn
  background-color #4782F6 !important
  border-radius 4px
div.lock-modal .q-item
  padding 0 0 !important
div.lock-modal .q-collapsible-sub-item
  padding 0 0 !important
div.lock-modal .q-item-label
  font-size 14px
  color #4782F6
div.lock-modal .q-item-main
  flex none
div.lock-modal .q-item-side
  min-width 0px
  color #4782F6
div.lock-modal .q-item-section
  margin-left 0px
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
      isPrivateNet: false,
      lock: this.$store.getters['lock/get'],
      showLockModal: false,
      showLockModidyModal: false,
      showMenuPop: false,
      checked: false,
      lockForm: {
        oldpassword: '',
        password: '',
        repeatPassword: ''
      }
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
    setting () {
      if (this.lock == null) {
        this.showLockModal = true
      } else {
        this.showLockModidyModal = true
      }
      this.showMenuPop = false
    },
    submit () {
      this.$store.commit('lock/insert', this.lockForm.password)
      this.$q.notify({ message: this.$t('lock.setting_success'), color: 'primary', timeout: 1000 })
      this.showLockModal = false
    },
    modify () {
      if (!this.lockForm.password || !this.lockForm.oldpassword || !this.lockForm.repeatPassword) {
        this.showLockModidyModal = false
        return
      }
      let oldpassword = this.lockForm.oldpassword
      if (oldpassword !== this.lock.password) {
        this.$q.notify(this.$t('lock.modify.lock_old_wrong_pwd'))
        return
      }
      if (this.lockForm.password !== this.lockForm.repeatPassword) {
        this.$q.notify(this.$t('lock.modify.lock_repeat_wrong_pwd'))
        return
      }
      this.$store.commit('lock/updateLockPassword', this.lockForm.password)
      this.$q.notify({ message: this.$t('lock.modify.success'), color: 'primary', timeout: 1000 })
      this.showLockModidyModal = false
    },
    reset () {
      this.lockForm.password = ''
      this.lockForm.repeatPassword = ''
      this.lockForm.oldpassword = ''
      this.showLockModal = false
      this.showLockModidyModal = false
    },
    updateState (status) {
      this.$store.commit('lock/updateLockStatus', status ? 1 : 0)
    }
  },
  created () {
    if (this.lock == null) {
      this.showLockModal = true
    } else {
      let status = this.lock.status
      if (status === 1) {
        this.checked = true
      }
    }
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
