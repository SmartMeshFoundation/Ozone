<template>
  <q-modal v-model="showSyncModal"
           no-esc-dismiss
           no-backdrop-dismiss
           minimized
           :content-css="{padding: '30px'}">

    <div class="row justify-center q-mb-md">
      <div class="q-display-1">正在等待区块数据同步完成...</div>
    </div>
    <div class="row justify-center">
      <q-progress indeterminate
                  animate
                  color="positive" />
    </div>

    <div class="row q-pa-md gutter-md justify-end">
      <div>
        <q-btn color="secondary"
               @click="skip"
               label="忽略" />
      </div>
    </div>
  </q-modal>
</template>

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
      showSyncModal: false
    }
  },
  methods: {
    show (opt) {
      this.$q.loading.show(_.extend(loadingOption, opt))
    },
    skip () {
      this.showSyncModal = false
      this.goto('/dashboard')
    },
    goto (path) {
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
        this.show({ message: 'Downloading client...' })
      }
    })

    ipc.on(Types.NODE_SYNC_STATUS, (event, status, result) => {
      if (!this.showSyncModal) {
        this.$q.loading.hide()
        this.showSyncModal = true
      }
    })
  },
  destroyed () {
    ipc.removeAllListeners(Types.NODE_ALL_DONE)
    ipc.removeAllListeners(Types.UI_ACTION_CLIENTBINARYSTATUS)
    ipc.removeAllListeners(Types.NODE_SYNC_STATUS)
  }
}
</script>
