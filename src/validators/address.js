import { req, withParams } from 'vuelidate/lib/validators/common'

const web3 = window.web3

export default withParams({ type: 'address' }, value => {
  return !req(value) || web3.utils.isAddress(value)
})
