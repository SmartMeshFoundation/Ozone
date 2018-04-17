<template>
  <div class="fixed-center text-center">
    <!-- <p class="text-faded">ozone startup...</p> -->
  </div>
</template>

<script>
import { ipcRenderer as ipc } from 'electron'
import { Types } from '../../src-electron/lib/channel/types'

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
  created () {
    this.$q.loading.show(loadingOption)

    ipc.on(Types.NODE_CONNECTED, (event, params) => {
      this.$q.loading.hide()
      this.$router.push('/dashboard')
    })
  },
  destroyed () {
    ipc.removeAllListeners(Types.NODE_CONNECTED)
  }
}
</script>
