const { ipcRenderer: ipc, remote } = require('electron')

window.web3 = remote.getGlobal('web3')
window.ipc = ipc

ipc.send('backendAction_setWindowId')
