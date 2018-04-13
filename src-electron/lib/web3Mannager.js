import Web3 from 'web3'

let web3

if (process.env.DEV) {
  web3 = new Web3('ws://localhost:8546')
} else {
  // TODO
  web3 = new Web3()
}

export default web3
