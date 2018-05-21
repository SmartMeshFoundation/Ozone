export const reset = (state, contracts) => {
  state.list = contracts
}

export const updateName = (state, obj) => {
  let contract = state.list.find(contract => contract._id === obj.id)
  if (contract != null) {
    // update vuex store
    contract.name = obj.name

    // update db
    const db = window.db
    let item = db.contracts.by('_id', obj.id)
    if (item != null) {
      console.log("Update contract's name from ", item.name, ' to ', obj.name)
      item.name = obj.name
    } else {
      console.log('Contract id: ', obj.id, ' not found.')
    }
  }
}

export const remove = (state, id) => {
  let idx = state.list.findIndex(element => {
    return element._id === id
  })

  if (idx !== -1) {
    state.list.splice(idx, 1)

    // delete from backend db
    const db = window.db
    let doc = db.contracts.by('_id', id)
    if (doc) {
      db.contracts.remove(doc)
    }
  }
}
