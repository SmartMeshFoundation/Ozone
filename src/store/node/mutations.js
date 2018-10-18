export const update = (state, data) => {
  state.blockNumber = data.blockNumber
  state.peers = data.peers
  state.gasPrice = data.gasPrice
}

export const setNetType = (state, type) => {
  state.netType = type
}
