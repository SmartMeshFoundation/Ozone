export const update = (state, { blockNumber, peers }) => {
  state.blockNumber = blockNumber
  state.peers = peers
}
