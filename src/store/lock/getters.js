export const get = state => {
  const db = window.db
  const lock = db.lock
  let results = lock.find({ _id: 1 })
  if (results.length > 0) {
    return results[0]
  } else {
    return null
  }
}
