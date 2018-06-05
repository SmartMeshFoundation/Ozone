import { remote } from 'electron'
import createIcon from 'blockies'

const cache = {}

export default ({ Vue }) => {
  Vue.prototype.$unit = 'smt'

  Vue.prototype.$settings = remote.getGlobal('settings')

  // generate identicon
  Vue.prototype.$icon = (seed, size) => {
    return (
      cache['IDP-' + seed] ||
      (cache['IDP-' + seed] = createIcon({
        seed,
        size,
        scale: 4
      }).toDataURL())
    )
  }
}
