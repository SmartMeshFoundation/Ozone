import log from '../log'
import _ from 'lodash'

class ObserveBlock {
  constructor () {
    this.subscription = null
  }

  start (state) {
    const web3 = global.web3
    if (_.isUndefined(state)) {
      throw new Error('No pass "state" parameter!')
    }

    this.subscription = web3.eth.subscribe('newBlockHeaders')
      .on('data', function (blockHeader) {
        // log.debug('Emitted newBlockHeaders: ', blockHeader)
        state.restore('account')
      })
  }

  stop () {
    // unsubscribes the subscription
    if (this.subscription != null) {
      this.subscription.unsubscribe(function (error, success) {
        if (success) {
          log.info('Successfully unsubscribed!')
        } else {
          log.error('Failed to unsubscribe "newBlockHeaders": ', error)
        }
      })
    }
  }
}

const observeBlock = new ObserveBlock()

export default observeBlock
