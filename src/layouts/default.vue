<template>
  <q-layout view="LHh Lpr LFf">
    <q-layout-header>
      <q-toolbar color="primary"
                 glossy
                 :inverted="$q.theme === 'ios'">
        <q-toolbar-title>
          <q-icon :name="toolbarIcon" /> {{ toolbarTitle }}
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
      <div class="bg-white q-pa-xs">
        <div class="row flex-center">
          <img alt="Quasar logo"
               src="statics/smart_mesh.jpeg"
               style="height: 75px;" />
          <big>OZONE</big>
        </div>
        <div class="row flex-center q-caption">
          <!-- <q-chip dense
                  icon="info"> ver {{$appVer}} </q-chip> -->
          <lang-switcher />
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

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      toolbarTitle: 'Ozone',
      toolbarIcon: 'layers'
    }
  },
  computed: {},
  methods: {
    updateToolbar (title, icon) {
      this.toolbarTitle = title
      this.toolbarIcon = icon
    }
  }
}
</script>

<style>

</style>
