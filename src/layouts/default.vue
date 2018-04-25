<template>
  <q-layout view="LHh Lpr LFf">
    <q-layout-header style="-webkit-app-region: drag">
      <q-toolbar color="primary"
                 :glossy="$q.theme === 'mat'"
                 :inverted="$q.theme === 'ios'">
        <q-toolbar-title>
          <q-icon :name="toolbarIcon" />
          <span>{{ toolbarTitle }}</span>
          <!-- <div slot="subtitle">Impossible made possible</div> -->
        </q-toolbar-title>
        <q-btn flat
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
               src="statics/smart_mesh.jpeg"
               style="height: 75px;" />
          <q-btn flat
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
                  class=""> {{blockNumber}} </q-chip>
          <q-chip dense
                  icon="timer"
                  class="q-ml-sm"> {{elapsedTime}} s</q-chip>
          <!-- <div>
            <lang-switcher />
          </div> -->
        </div>
      </div>
      <q-list no-border
              link
              inset-delimiter
              separator>
        <q-list-header>{{ $t('nav.header.account') }}</q-list-header>
        <q-item to="/wallet"
                @click.native="updateToolbar($t('nav.wallet.label'), 'fa-credit-card')">
          <q-item-side icon="fa-credit-card" />
          <q-item-main :label="$t('nav.wallet.label')"
                       :sublabel="$t('nav.wallet.sublabel')" />
        </q-item>
        <q-item to="/transfer/"
                @click.native="updateToolbar($t('nav.transfer.label'), 'fa-exchange-alt')">
          <q-item-side icon="fa-exchange-alt" />
          <q-item-main :label="$t('nav.transfer.label')"
                       :sublabel="$t('nav.transfer.sublabel')" />
        </q-item>
        <q-list-header>{{ $t('nav.header.contract') }}</q-list-header>
        <q-item to="/deployContract">
          <q-item-side icon="code" />
          <q-item-main :label="$t('nav.deploy_contract.label')"
                       :sublabel="$t('nav.deploy_contract.sublabel')" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view @updateToolbar="updateToolbar" />
    </q-page-container>
  </q-layout>
</template>

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
      return this.$store.state.block.number
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
