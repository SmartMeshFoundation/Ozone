export const get = state => id => {
  return state.list.find(c => c._id === id)
}

export const getTokens = state => address_ => {
  let tokens = window.db.tokens.find({ address: address_ })
  if (tokens.length > 0) {
    tokens = tokens[0]['tokens']
  } else {
    return []
  }
  if (tokens === undefined) {
    return []
  }
  tokens = tokens.filter(address => {
    let contract = state.list.find(c => c.contractAddress === address)
    if (contract === undefined || contract === null) {
      return false
    } else {
      return true
    }
  })
  tokens = tokens.map(address => {
    let contract = state.list.find(c => c.contractAddress === address)
    let myContract = new global.web3.eth.Contract(JSON.parse(contract.abi), address)
    myContract.methods.name().call().then(name => {
      contract['tokenName'] = name
    })
    myContract.methods.symbol().call().then(symbol => {
      contract['tokenSymbol'] = symbol
    })

    myContract.methods.balanceOf(address_).call().then(balance => {
      contract['balance'] = balance
    })

    myContract.methods.decimals().call().then(decimals => {
      contract['decimals'] = decimals
    })
    return contract
  })
  return tokens
}

export const erc20Tokens = state => {
  return state.list.filter(cont => {
    let funCount = 0
    let abi = JSON.parse(cont.abi)
    let funcs = ['name', 'decimals', 'symbol', 'totalSupply', 'balanceOf', 'transfer', 'transferFrom']
    abi.forEach(item => {
      if (item.type === 'function') {
        let funName = item.name
        if (funcs.includes(funName)) {
          funCount++
        }
      }
    })
    return funCount === 7
  }).map(token => {
    let myContract = new global.web3.eth.Contract(JSON.parse(token.abi), token.contractAddress)
    myContract.methods.name().call().then(name => {
      token['tokenName'] = name
    })
    myContract.methods.symbol().call().then(symbol => {
      token['tokenSymbol'] = symbol
    })
    return token
  })
}
