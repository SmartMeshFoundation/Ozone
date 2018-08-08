export default ({ Vue }) => {
  Vue.component('account-list', () => import('../components/AccountList'))
  Vue.component('account-item', () => import('../components/AccountItem'))
  Vue.component('ident-icon', () => import('../components/IdentIcon'))
  Vue.component('lang-switcher', () => import('../components/LangSwitcher'))
  Vue.component('transaction-list', () => import('../components/TransactionList'))
  Vue.component('transaction-item', () => import('../components/TransactionItem'))
  Vue.component('ani-number', () => import('../components/AnimateNumber'))
  Vue.component('contract-item', () => import('../components/ContractItem'))
  Vue.component('token-item', () => import('../components/TokenItem'))
  Vue.component('token-info', () => import('../components/TokenInfo'))
}
