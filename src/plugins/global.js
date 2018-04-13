import { remote } from 'electron'
import createIcon from 'blockies'

const cache = {}

export default ({ Vue }) => {
  Vue.prototype.$unit = 'smt'

  const db = remote.getGlobal('db')
  Vue.prototype.$db = typeof db === 'object' ? db : {}

  const web3 = remote.getGlobal('web3')
  Vue.prototype.$web3 = typeof web3 === 'object' ? web3 : {}

  Vue.prototype.$setting = remote.getGlobal('setting')

  // 生成 identicon
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
