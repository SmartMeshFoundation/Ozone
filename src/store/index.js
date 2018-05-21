import Vue from 'vue'
import Vuex from 'vuex'

import account from './account'
import transaction from './transaction'
import node from './node'
import lan from './lan'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    account,
    transaction,
    node,
    lan
  }
})

if (process.env.DEV && module.hot) {
  module.hot.accept(['./account', './transaction', './node', './lan'], () => {
    const newAccount = require('./account').default
    const newTransaction = require('./transaction').default
    const newnode = require('./node').default
    const newLan = require('./lan').default

    store.hotUpdate({ modules: {
      account: newAccount,
      transaction: newTransaction,
      node: newnode,
      lan: newLan
    } })
  })
}

export default store
