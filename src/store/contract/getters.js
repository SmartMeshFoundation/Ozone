export const get = state => id => {
  return state.list.find(c => c._id === id)
}
