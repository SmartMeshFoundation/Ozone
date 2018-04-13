import Vue from 'vue'
import Vuex from 'vuex'

import account from './account'
import transaction from './transaction'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    account,
    transaction
  }
})

if (process.env.DEV && module.hot) {
  module.hot.accept(['./account', './transaction'], () => {
    const newAccount = require('./account').default
    const newTransaction = require('./transaction').default
    store.hotUpdate({ modules: {
      account: newAccount,
      transaction: newTransaction
    } })
  })
}

export default store
