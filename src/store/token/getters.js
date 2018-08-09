export const get = state => address => {
  let items = window.db.tokens.find({ address: address })
  return items.length === 0 ? null : items[0]
}
