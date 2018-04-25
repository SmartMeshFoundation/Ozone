import observeBlock from './observeBlock'
import observePendingTransaction from './observePendingTransaction'

const observers = [
  observeBlock,
  observePendingTransaction
]

export default observers
