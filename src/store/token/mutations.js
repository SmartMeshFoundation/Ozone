export const updateToken = (state, obj) => {
  let tokensDb = window.db.tokens
  let items = tokensDb.find({ address: obj.address })
  let item = {}
  if (items.length > 0) {
    item = items[0]
    item['tokens'] = obj['tokens']
    tokensDb.update(item)
  } else {
    item = obj
    tokensDb.insert(item)
  }
}
