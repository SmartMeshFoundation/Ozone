
// reset vuex store account list
export const reset = (state, accounts) => {
  state.list = accounts
}

// update account's name
export const updateAccountName = (state, obj) => {
  let account = state.list.find(account => account.address === obj.address)
  if (account != null) {
    // update vuex store
    account.name = obj.name

    // update database of back end
    const db = window.db
    const accounts = db.accounts
    let item = accounts.by('_id', obj.address)
    if (item != null) {
      console.log("Update account's name from ", item.name, ' to ', obj.name)
      item.name = obj.name
      accounts.update(item)
    } else {
      console.log('Insert account: ', obj)
      accounts.insert({ _id: obj.address, name: obj.name })
    }
  }
}
