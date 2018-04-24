import Vue from 'vue'
import Vuex from 'vuex'

import account from './account'
import transaction from './transaction'
import block from './block'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    account,
    transaction,
    block
  }
})

if (process.env.DEV && module.hot) {
  module.hot.accept(['./account', './transaction', './block'], () => {
    const newAccount = require('./account').default
    const newTransaction = require('./transaction').default
    const newBlock = require('./block').default

    store.hotUpdate({ modules: {
      account: newAccount,
      transaction: newTransaction,
      block: newBlock
    } })
  })
}

export default store
