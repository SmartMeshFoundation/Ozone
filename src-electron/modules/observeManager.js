import observers from './observer'

class ObserveManager {
  start () {
    observers.forEach(observer => {
      observer.start()
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

export default new ObserveManager()
