import Loki from 'lokijs'
import path from 'path'
import setting from './setting'

let dbFile = path.resolve(setting.userDataPath, setting.appName + '.db')

const db = new Loki(dbFile, {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 1000
})

function databaseInitialize () {
  if (!db.getCollection('accounts')) {
    db.addCollection('accounts', {
      unique: ['address'],
      autoupdate: true
    })
  }
  db.accounts = db.getCollection('accounts')

  if (!db.getCollection('transactions')) {
    db.addCollection('transactions', {
      unique: ['hash'],
      autoupdate: true
    })
  }
  db.transactions = db.getCollection('transactions')
}

export default db
