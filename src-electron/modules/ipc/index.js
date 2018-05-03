import compiler from './compiler'

const channels = [
  compiler
]

class IpcManager {
  bind () {
    channels.forEach(channel => {
      channel.bind()
    })
  }
}

export default new IpcManager()
