const NAV_EN_DICT = {
  'wallet': '钱包',
  'Transfer': '转账'
}
const NAV_ZH_DICT = {
  '钱包': 'wallet',
  '转账': 'Transfer'
}

export const updateByLan = (state, data) => {
  let lan = data.lan
  let title = state.titleBar
  if (lan === 'zh') {
    state.titleBar = NAV_EN_DICT[title]
  } else {
    state.titleBar = NAV_ZH_DICT[title]
  }
}

export const update = (state, data) => {
  state.titleBar = data
}
