export default {
  button: {
    ok: '确定',
    cancel: '取消',
    skip: '忽略'
  },

  nav: {
    header: {
      account: '账户管理',
      contract: '智能合约'
    },
    wallet: {
      label: '钱包',
      sublabel: '钱包地址管理',
      account: '账户明细'
    },
    transfer: {
      label: '转账',
      sublabel: '账户之间资产转移'
    },
    contract: {
      deploy: {
        label: '部署合约',
        sublabel: '发布合约到 Spectrum'
      },
      my: {
        label: '我的合约',
        sublabel: '管理链上的合约',
        view: '合约详情',
        add: '添加合约'
      }
    }
  },

  notify: {
    error_password: '账户密码错误',
    ozone_downloaded: 'ozone日志文件(ozone.log)已经下载到桌面，请使用文本编辑器查看'
  },

  account: {
    balance: '账户余额',
    account_list: '账户列表',
    total_balance: '总资产',
    mondify_name: '修改账户名称',
    btn: {
      transfer: '转账',
      backupAccount: '备份',
      importAccount: '导入账户',
      add: '创建一个新账户'
    },
    copy: {
      alert: '警告：拷贝地址',
      content: '你同意拷贝账户地址到系统剪切板吗？',
      success: '拷贝地址成功！'
    },
    create: {
      title: '建一个新账户',
      text1: '为你的账户设置密码。',
      text2: '请牢记你的密码，如果遗忘密码将没有任何途径可以找回！',
      password_tip1: '账户密码必须不少于8位',
      password_msg1: '输入账户密码',
      password_tip2: '两次输入的密码不一致，请重新输入！',
      password_msg2: '重复输入密码'
    }
  },

  tx: {
    list: {
      caption: '最近交易',
      pending: '待确认',
      block_confirm: '块',
      abi: '创建/调用合约',
      transfer: '账户间转账'
    },
    text: {
      noTxs: '还未有交易历史'
    },
    transfer: {
      from_error: '请选择转出账户',
      from_label: '转出账户',
      to_error: '不是合法的账户地址',
      to_label: '转入账户',
      balance_error: '转出金额必须大于0',
      balance_label: '转出金额',
      balance: '余额',
      fee: '估计交易费用',
      btn: '确认转账',
      insufficient_funds: '余额不足',
      transaction_detail: '交易详情',
      transaction_hash: '交易Hash',
      block_number: '区块高度',
      from: '转出',
      to: '转入',
      confirm: {
        title: '确认转账',
        transfer_amount: '转出金额',
        fee: '手续费',
        total: '总金额',
        enter_pwd: '请输入账户密码',
        wrong_pwd: '密码错误！'
      }
    },
    type: {
      a2a: '账户间转账',
      call_c: '调用合约',
      create_c: '创建合约'
    }
  },
  splash: {
    downloading: {
      title: '应用程序初始化 ...'
    },
    syncing: {
      title: '正在同步区块数据 ...'
    }
  },

  ui: {
    toolbar: {
      title: 'Ozone'
    }
  },

  contract: {
    add: {
      description: '在 "我的合约" 添加已经部署到 Spectrum 的合约',
      name: {
        label: '合约名称',
        error: '请输入合约名称',
        placeholder: '自定义合约的名称'
      },
      abi: {
        label: '智能合约的 ABI',
        error: '合约的 ABI 不能为空',
        placeholder: 'Json Interface'
      },
      address: {
        label: '合约地址',
        error: '非法的合约地址',
        placeholder: '合约地址'
      },
      btn: {
        cancel: ' 取 消 ',
        ok: ' 添加合约 '
      },
      notify: {
        exists: '合约地址已经存在！'
      }
    },
    deploy: {
      advancedMode: '高级模式',
      source: {
        error: '源码分析发生错误',
        placeholder: '在这里粘贴 Solidity 源码'
      },
      bytecode: {
        label: '合约的 字节码',
        error: '合约的 字节码 不能为空',
        placeholder: '0x......'
      },
      contract_name: {
        label: '合约名称',
        error: '请选择需要发布的合约'
      },
      constructor: {
        label: '构造参数'
      },
      custom_name: {
        label: '自定义名称',
        placeholder: '自定义合约的名称'
      },
      from: {
        label: '合约所有者',
        error: '请选择发布合约的账户'
      },
      value: {
        label: '金额',
        error: '金额必须是数字'
      },
      btn: {
        create: ' 创建合约 '
      },
      confirm: {
        title: '确认部署合约',
        placeholder: '输入合约所有者的账户密码'
      }
    },
    my: {
      btn: {
        import: '导 入',
        backup: '备 份',
        add: '添加合约'
      },
      notify: {
        bak_success: '备份成功！',
        bak_fails: '备份失败！',
        imp_success: '成功导入 {0} 个合约.',
        imp_invalid_format: '无法识别的文件格式'
      },
      open_dialog: {
        title: '选择合约备份文件'
      },
      delete_dialog: {
        title: '警告',
        message: '删除合约: {0}'
      }
    },
    view: {
      status: '查看合约状态',
      methods: '调用合约方法',
      from_label: '调用合约账户',
      from_block: '起始区块号',
      btn_query: '查询历史事件',
      btn_watch: '监听合约事件',
      column: {
        block_number: '区块号',
        event: '事件',
        return_val: '返回值'
      },
      dialog: {
        title: '解锁账户',
        message: '请输入调用合约的账户密码'
      }
    }
  },
  lock: {
    title: '登录锁设置',
    password_msg1: '请输入登录锁密码',
    password_msg2: '确认登录锁密码',
    lock_wrong_pwd: '密码错误',
    setting_success: '登录锁设置成功',
    menu: '登录锁',
    modify:
      {
        open: '开启登录锁',
        modify_pwd: '修改登录锁密码',
        password_msg1: '输入当前登录锁密码',
        password_msg2: '输入新登录锁密码',
        password_msg3: '确认新登录锁密码',
        success: '登录锁密码修改成功',
        lock_old_wrong_pwd: '原登录锁密码错误',
        lock_repeat_wrong_pwd: '两次输入的密码不一致'
      }
  }
}
