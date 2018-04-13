export const get = state => hash => {
  return state.list.find(tx => tx.hash === hash)
}
