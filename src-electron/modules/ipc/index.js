import compiler from './compiler'
import common from './common'

const channels = [
  compiler,
  common
]

class IpcManager {
  bind () {
    channels.forEach(channel => {
      channel.bind()
    })
  }
}

export default new IpcManager()
