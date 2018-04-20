import observers from './observer'

class ObserveManager {
  start (store) {
    observers.forEach(observer => {
      observer.start(store)
    })
  }

  stop () {
    observers.forEach(observer => {
      if (observer.stop) {
        observer.stop()
      }
    })
  }
}

const observeManager = new ObserveManager()

export default observeManager
