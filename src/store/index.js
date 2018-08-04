import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import account from './account'
import transaction from './transaction'
import node from './node'
import contract from './contract'
import ui from './ui'
import lock from './lock'

let modules = {
  account,
  transaction,
  node,
  contract,
  ui,
  lock
}

const store = new Vuex.Store({ modules })

// for dev store hot load
if (process.env.DEV && module.hot) {
  module.hot.accept([
    './account',
    './transaction',
    './node',
    './contract',
    './ui'
  ], () => {
    store.hotUpdate({
      modules: {
        account: require('./account').default,
        transaction: require('./transaction').default,
        node: require('./node').default,
        contract: require('./contract').default,
        // lan: require('./lan').default,
        ui: require('./ui').default
      }
    })
  }
  )
}

export default store
