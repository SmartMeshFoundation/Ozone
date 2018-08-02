import solc from 'solc'
import { ipcMain as ipc } from 'electron'
import { Types } from './types'
import logger from '../logger'

const log = logger.create('ConstractCompiler')

class ContractCompiler {
  bind () {
    ipc.on(Types.UI_ACTION_COMPILE_SYNC, (event, source) => {
      log.debug('Compile solidity source...')
      let output = solc.compile(source, 1)
      // for (var contractName in output.contracts) {
      //   log.debug('contracts.', contractName, ' bytecode: ' + output.contracts[contractName].bytecode)
      //   log.debug('contracts.', contractName, ' interface: ' + output.contracts[contractName].interface)
      // }
      event.returnValue = output
    })

    // ipc.on(Types.UI_ACTION_COMPILE, (event, source) => {
    //   this._compile(source)
    //     .then(output => {
    //       for (var contractName in output.contracts) {
    //         log.debug('contracts.', contractName, ' bytecode: ' + output.contracts[contractName].bytecode)
    //         log.debug('contracts.', contractName, ' interface: ' + output.contracts[contractName].interface)
    //       }
    //       global.windows.broadcast(Types.UI_ACTION_COMPILE_REPLY, output)
    //     })
    // })
  }

  // _compile (source) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       let output = solc.compile(source, 1)
  //       resolve(output)
  //     } catch (err) {
  //       log.error(err)
  //       reject(new Error('Compile error.', err))
  //     }
  //   })
  // }
}

export default new ContractCompiler()
