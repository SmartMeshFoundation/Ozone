import { req, withParams } from 'vuelidate/lib/validators/common'
import { remote } from 'electron'
const web3 = remote.getGlobal('web3')

export default withParams({ type: 'address' }, value => {
  return !req(value) || web3.utils.isAddress(value)
})
