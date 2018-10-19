export default {
  button: {
    ok: 'OK',
    cancel: 'CANCEL',
    skip: 'SKIP'
  },

  nav: {
    header: {
      account: 'ACCOUNTS',
      contract: 'CONTRACTS'
    },
    wallet: {
      label: 'Wallet',
      sublabel: 'Address Management',
      account: 'Account Detail'
    },
    transfer: {
      label: 'Transfer',
      sublabel: 'Transfer value between accounts'
    },
    contract: {
      deploy: {
        label: 'Deploy Contract',
        sublabel: 'Deploy contract to Spectrum'
      },
      my: {
        label: 'My Contracts',
        sublabel: 'Manage contracts on Spectrum',
        view: 'Detail',
        add: 'Add Contract'
      }
    }
  },

  notify: {
    error_password: 'Invalid account\'s password!',
    ozone_downloaded: 'ozone log file(ozone.log) already download to desktop,please view by text editor'
  },

  account: {
    balance: 'Balance',
    account_list: 'Account List',
    total_balance: 'Total Balance',
    mondify_name: 'Modify account name',
    btn: {
      transfer: 'Transfer',
      backupAccount: 'Backup',
      add: 'New Account',
      importAccount: 'Import Account'
    },
    copy: {
      alert: 'WARNING: Copy Address',
      content: 'Do you agree to copy the account address to the system clipboard？',
      success: 'Copy address success!'
    },
    create: {
      title: 'Create a new address',
      text1: 'Set a password for your account.',
      text2: 'Please remember your password. If you forget the password, there will be no way to retrieve it.',
      password_tip1: 'The password of account must be between 6 and 16 characters',
      password_msg1: 'Enter password',
      password_tip2: 'Entered passwords differ, please try again.',
      password_msg2: 'Confirm password'
    }
  },

  tx: {
    list: {
      caption: 'Recent Transactions',
      pending: 'Pending...',
      block_confirm: 'Blocks',
      abi: 'Create or invoke contract',
      transfer: 'Transfer'
    },
    text: {
      noTxs: 'No transaction history'
    },
    transfer: {
      from_error: 'Please choose an account for transfer',
      from_label: 'From',
      to_error: 'Not a legal address',
      to_label: 'To',
      balance_error: 'The transfer amount must be greater than 0',
      balance_label: 'Amount',
      balance: 'Balance',
      fee: 'Estimated Fee',
      btn: 'confirm',
      insufficient_funds: 'Insufficient funds',
      transaction_detail: 'Transaction Details',
      transaction_hash: 'Transaction Hash',
      block_number: 'Block Number',
      from: 'From',
      to: 'To',
      confirm: {
        title: 'Transfer Confirm',
        transfer_amount: 'Transfer Amount',
        fee: 'Fee',
        total: 'Total Amount',
        enter_pwd: 'Please enter password',
        wrong_pwd: 'Wrong Password!',
        muti_keystore: 'multiple keys match address, please remove duplicates from keystore!'
      }
    },
    type: {
      a2a: 'Accounts Transfer',
      call_c: 'Transact Contract',
      create_c: 'Create Contract'
    }
  },
  splash: {
    downloading: {
      title: 'Ozone is initializing ...'
    },
    syncing: {
      title: 'Ozone is syncing chaindata ...'
    }
  },

  ui: {
    toolbar: {
      title: 'Ozone'
    }
  },

  contract: {
    add: {
      description: 'Add contracts that already deployed to Spectrum to "My Contracts" ',
      name: {
        label: 'Name',
        error: 'Please fill in contract\'s name',
        placeholder: 'Custom the contract\'s name'
      },
      abi: {
        label: 'ABI',
        error: 'Please fill in contract\'s ABI',
        placeholder: 'Json Interface'
      },
      address: {
        label: 'Address',
        error: 'Invalid address!',
        placeholder: 'Contract\'s address'
      },
      btn: {
        cancel: ' CANCEL ',
        ok: ' ADD '
      },
      notify: {
        exists: 'Contract address already exists!'
      }
    },
    deploy: {
      advancedMode: 'Advanced Mode',
      source: {
        error: 'Source code analysis error',
        placeholder: 'Paste Solidity source here'
      },
      bytecode: {
        label: 'Bytecode',
        error: 'Please fill in bytecode',
        placeholder: '0x......'
      },
      contract_name: {
        label: 'Name',
        error: 'Please select a contract'
      },
      constructor: {
        label: 'Constructor'
      },
      custom_name: {
        label: 'Custom Name',
        placeholder: 'Custom the name of contract'
      },
      from: {
        label: 'Owner',
        error: 'Please select a account to deploy contract'
      },
      value: {
        label: 'Amount',
        error: 'Amount must be number'
      },
      btn: {
        create: 'Create Contract'
      },
      confirm: {
        title: 'Deployment Confirmation',
        placeholder: 'Enter password of contract owner'
      }
    },
    my: {
      btn: {
        import: 'Import',
        backup: 'Backup',
        add: ' Add '
      },
      notify: {
        bak_success: 'Successfully Backup!',
        bak_fails: 'Failed to Backup!',
        imp_success: 'Successfully imported {0} contracts.',
        imp_invalid_format: 'Invalid file format!'
      },
      open_dialog: {
        title: 'Backup my contracts'
      },
      delete_dialog: {
        title: 'Remove Warning',
        message: 'Will to remove: {0}?'
      }
    },
    view: {
      status: 'Call Contract',
      methods: 'Transact Contract',
      from_label: 'From',
      from_block: 'Start block number',
      btn_query: 'Get Past Events',
      btn_watch: 'Watch Events',
      column: {
        block_number: 'Block Number',
        event: 'Event',
        return_val: 'Return Values'
      },
      dialog: {
        title: 'Unlock Account',
        message: 'Please enter the password of From account'
      }
    }
  },
  lock: {
    title: 'Login Lock Setting',
    password_msg1: 'Enter Login Lock password',
    password_msg2: 'Confirm Login Lock password',
    lock_wrong_pwd: 'Wrong Password',
    menu: 'Login Lock',
    setting_success: 'Login Lock set ok',
    modify:
      {
        open: 'Turn on Login Lock',
        modify_pwd: 'modify Login Lock Password',
        password_msg1: 'Enter Current Login Lock password',
        password_msg2: 'Enter New Login Lock password',
        password_msg3: 'Confirm New Login Lock password',
        success: 'Login Lock modify ok',
        lock_old_wrong_pwd: 'Wrong Old Password',
        lock_blank_pwd: 'password can not be empty',
        lock_length_pwd: 'Please enter 8-20 password',
        lock_repeat_wrong_pwd: 'Entered passwords differ'
      }
  },
  dialog: {
    rmdata: {
      title: 'WARNING: Clean Chaindata',
      message: 'The block database will be cleared and the application will be restarted. Please confirm!'
    }
  },
  network: {
    test: 'Test Network',
    main: 'Main Network'
  }
}
