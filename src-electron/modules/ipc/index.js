// import transaction from './transaction'

const channels = [
]

class IpcManager {
  bind () {
    channels.forEach(channel => {
      channel.bind()
    })
  }
}

export default new IpcManager()
