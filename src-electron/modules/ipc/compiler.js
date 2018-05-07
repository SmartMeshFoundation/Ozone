import solc from 'solc'
import { ipcMain as ipc } from 'electron'
import { Types } from './types'
import logger from '../logger'

const log = logger.create('ConstractCompiler')

class ContractCompiler {
  bind () {
    ipc.on(Types.UI_ACTION_COMPILE_SYNC, (event, source) => {
      let output = solc.compile(source, 1)
      let rtn = {}
      for (var contractName in output.contracts) {
        // code and ABI that are needed by web3
        log.debug('contracts.', contractName, ' bytecode: ' + output.contracts[contractName].bytecode)
        log.debug('contracts.', contractName, ' interface: ' + output.contracts[contractName].interface)
      }
      rtn.contracts = output.contracts
      rtn.errors = output.errors
      event.returnValue = rtn
    })
  }
}

export default new ContractCompiler()
