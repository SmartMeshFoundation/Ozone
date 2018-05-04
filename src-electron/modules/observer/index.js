import observeAccounts from './observeAccounts'
import observeBlock from './observeBlock'
import observePendingTransaction from './observePendingTransaction'

const observers = [
  observeAccounts,
  observeBlock,
  observePendingTransaction
]

export default observers
