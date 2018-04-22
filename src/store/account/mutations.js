
// 更新账户列表
export const reset = (state, accounts) => {
  state.list = accounts
}

// 更新账户名称
export const updateAccountName = (state, obj) => {
  let account = state.list.find(account => account.address === obj.address)
  if (account != null) {
    // 更新缓存数据
    account.name = obj.name

    // 更新数据库
    const db = window.db
    const accounts = db.accounts
    let item = accounts.by('_id', obj.address)
    if (item != null) {
      console.log("Update account's name from ", item.name, ' to ', obj.name)
      item.name = obj.name
      // accounts.update(item)
    } else {
      console.log('Insert account: ', obj)
      accounts.insert({ _id: obj.address, name: obj.name })
    }
  }
}
