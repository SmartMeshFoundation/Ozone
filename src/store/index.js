import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import account from './account'
import transaction from './transaction'
import node from './node'
import lan from './lan'
import contract from './contract'

let modules = {
  account,
  transaction,
  node,
  contract,
  lan
}

const store = new Vuex.Store({ modules })

// for dev store hot load
if (process.env.DEV && module.hot) {
  module.hot.accept([
    './account',
    './transaction',
    './node',
    './contract',
    './lan'
  ], () => {
    store.hotUpdate({
      modules: {
        account: require('./account').default,
        transaction: require('./transaction').default,
        node: require('./node').default,
        contract: require('./contract').default,
        lan: require('./lan').default
      }
    })
  }
  )
}

export default store
