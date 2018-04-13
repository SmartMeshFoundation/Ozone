import { remote } from 'electron'

// 更新账户列表
export const reset = (state, accounts) => {
  state.list = accounts
}

// 更新账户名称
export const updateAccountName = (state, obj) => {
  console.log('Update account name: ', obj)
  let account = state.list.find(account => account.address === obj.address)
  if (account != null) {
    // 更新缓存数据
    account.name = obj.name

    // 更新数据库
    const db = remote.getGlobal('db')
    const accounts = db.accounts
    account = accounts.by('address', obj.address)
    if (account != null) {
      console.log("Update account's name from ", account.name, ' to ', obj.name)
      account.name = obj.name
    } else {
      console.log('Insert account: ', obj)
      accounts.insert({ address: obj.address, name: obj.name })
    }
  }
}
