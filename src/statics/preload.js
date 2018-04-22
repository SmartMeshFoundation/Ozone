const { ipcRenderer: ipc, remote } = require('electron')

window.web3 = remote.getGlobal('web3')
window.db = remote.getGlobal('db')
window.ipc = ipc

ipc.send('backendAction_setWindowId')
