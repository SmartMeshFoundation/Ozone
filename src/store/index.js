import Vue from 'vue'
import Vuex from 'vuex'

import account from './account'
import transaction from './transaction'
import node from './node'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    account,
    transaction,
    node
  }
})

if (process.env.DEV && module.hot) {
  module.hot.accept(['./account', './transaction', './node'], () => {
    const newAccount = require('./account').default
    const newTransaction = require('./transaction').default
    const newnode = require('./node').default

    store.hotUpdate({ modules: {
      account: newAccount,
      transaction: newTransaction,
      node: newnode
    } })
  })
}

export default store
