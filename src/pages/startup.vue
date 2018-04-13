<template>
  <div class="fixed-center text-center">
    <!-- <p class="text-faded">ozone startup...</p> -->
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
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
  methods: {
    async checkClient () {
      // TODO check cleint update
    },
    async startClient () {
      // TODO run client
    },
    checkNetwork () {
      const $vm = this
      $vm.$web3.eth.net.isListening()
        .then(() => {
          ipcRenderer.send(Types.CLIENT_READY)

          $vm.$q.loading.hide()
          $vm.$router.push('/dashboard')
        })
        .catch(error => {
          console.log(error)
          $vm.$q.loading.hide()
          $vm.$q.dialog({message: '无法连接到网络节点！', preventClose: true}).then(() => {
            $vm.$q.loading.show(loadingOption)
            setTimeout($vm.checkNetwork, 3000)
          })
        })
    }
  },
  created () {
    this.$q.loading.show(loadingOption)
    this.checkNetwork()
  }
}
</script>
