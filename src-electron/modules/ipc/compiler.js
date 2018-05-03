import solc from 'solc'
import { ipcMain as ipc } from 'electron'
import { Types } from './types'
import logger from '../logger'

const log = logger.create('ConstractCompiler')

class ContractCompiler {
  bind () {
    ipc.on(Types.UI_ACTION_COMPILE_SYNC, (event, source) => {
      let output = solc.compile(source, 1)
      for (var contractName in output.contracts) {
        // code and ABI that are needed by web3
        log.debug(
          contractName + ': ' + output.contracts[contractName].bytecode
        )
        log.debug(
          contractName +
            ': ' +
            JSON.parse(output.contracts[contractName].interface)
        )
      }
      event.returnValue = output
    })
  }
}

export default new ContractCompiler()
