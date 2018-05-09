<template>
  <div>
    <q-modal class="sync-modal" v-model="showSyncing"
            no-esc-dismiss
            no-backdrop-dismiss
            minimized
            :content-css="{padding: '20px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-title">{{ $t('splash.syncing.title') }}</div>
      </div>
      <div class="row justify-center">
        <q-progress indeterminate
                    animate
                    color="info" />
      </div>
      <div class="row q-pa-md gutter-md">
        <div v-if="synced" class="sync-num">
          {{synced}}/{{totalBlock}}
        </div>
        <div class="sync-ign">
          <q-btn color="info"
                @click="skip"
                :label="$t('button.skip')"
                flat />
        </div>
      </div>
    </q-modal>

    <q-modal v-model="showDownloading"
            no-esc-dismiss
            no-backdrop-dismiss
            minimized
            :content-css="{padding: '20px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-title">{{ $t('splash.downloading.title') }}</div>
      </div>
      <div class="row justify-center">
        <q-progress indeterminate
                    animate
                    color="positive" />
      </div>

    </q-modal>
  </div>
</template>
<style lang="stylus">
  div.sync-modal .modal-content
      border-radius 14px !important
      width 350px
      height 135px
  div.sync-modal .sync-num
      position relative
      top 5px
      left -20px
      color #31ccec
  div.sync-modal .sync-ign
      position absolute
      top 43px
      right 5px
</style>

<script>
import { Types } from '../../src-electron/modules/ipc/types'

const ipc = window.ipc
const _ = window._

let loadingOption = {
  spinner: 'QSpinnerBars',
  message: 'Ozone startup...',
  messageColor: 'white',
  spinnerSize: 64, // in pixels
  spinnerColor: 'white',
  delay: 400 // ms
  //   customClass: 'bg-primary'
}

export default {
  data () {
    return {
      showSyncing: false,
      showDownloading: false,
      totalBlock: 0,
      synced: 0
    }
  },
  methods: {
    show (opt) {
      this.$q.loading.show(_.extend(loadingOption, opt))
    },
    skip () {
      console.log('skip sync')
      this.showSyncing = false
      this.$q.loading.show(loadingOption)
      ipc.send(Types.NODE_SYNC_SKIP)
      // this.goto('/dashboard')
    },
    goto (path) {
      console.log('go to: ', path)
      this.$router.push(path)
    }
  },
  created () {
    this.$q.loading.show(loadingOption)
    ipc.on(Types.NODE_ALL_DONE, (event, params) => {
      this.$q.loading.hide()
      this.goto('/dashboard')
    })

    ipc.on(Types.UI_ACTION_CLIENTBINARYSTATUS, (event, status, data) => {
      if (status === 'downloading') {
        console.log('downloading client')
        this.$q.loading.hide()
        this.showSyncing = false
        this.showDownloading = true
      }
    })

    ipc.on(Types.NODE_SYNC_STATUS, (event, status, result) => {
      if (!this.showSyncing) {
        this.$q.loading.hide()
        this.showDownloading = false
        this.showSyncing = true
      }
    })

    ipc.on(Types.SYNC_BLOCK_NUMBER, (event, synced, totalBlock) => {
      if (this.showSyncing) {
        this.totalBlock = totalBlock
        this.synced = synced
      }
    })
  },
  destroyed () {
    ipc.removeAllListeners(Types.NODE_ALL_DONE)
    ipc.removeAllListeners(Types.UI_ACTION_CLIENTBINARYSTATUS)
    ipc.removeAllListeners(Types.NODE_SYNC_STATUS)
    ipc.removeAllListeners(Types.SYNC_BLOCK_NUMBER)
  }
}
</script>
