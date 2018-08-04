export const insert = (state, password) => {
  const db = window.db
  const lock = db.lock
  let l = { _id: 1, status: 1, password: password }
  lock.insert(l)
}

export const updateLockStatus = (state, status) => {
  const db = window.db
  const lock = db.lock
  let item = lock.by('_id', 1)
  item['status'] = status
  lock.update(item)
}

export const updateLockPassword = (state, password) => {
  const db = window.db
  const lock = db.lock
  let item = lock.by('_id', 1)
  item['password'] = password
  lock.update(item)
}
