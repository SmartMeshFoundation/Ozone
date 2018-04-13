// 根据 address 查找缓存中的账户
export const get = state => address => {
  return state.list.find(
    account => account.address.toLowerCase() === address.toLowerCase()
  )
}

export const name = state => address => {
  // console.log('account list: ', state.list)
  let account = state.list.find(account => account.address.toLowerCase() === address.toLowerCase())

  if (account != null) {
    return account.name
  } else {
    return address
  }
}
