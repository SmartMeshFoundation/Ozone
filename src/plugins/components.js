import AccountList from '../components/AccountList'
import AccountItem from '../components/AccountItem'
import IdentIcon from '../components/IdentIcon'
import LangSwitcher from '../components/LangSwitcher'
import TransactionList from '../components/TransactionList'
import TransactionItem from '../components/TransactionItem'
import AnimateNumber from '../components/AnimateNumber'

export default ({ Vue }) => {
  Vue.component('account-list', AccountList)
  Vue.component('account-item', AccountItem)
  Vue.component('ident-icon', IdentIcon)
  Vue.component('lang-switcher', LangSwitcher)
  Vue.component('transaction-list', TransactionList)
  Vue.component('transaction-item', TransactionItem)
  Vue.component('ani-number', AnimateNumber)
}
