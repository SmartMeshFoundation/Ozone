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
      sublabel: 'Manage your accounts'
    },
    transfer: {
      label: 'Transfer',
      sublabel: 'Transfer value to other accounts'
    },
    deploy_contract: {
      label: 'Deploy',
      sublabel: 'Deploy your smart contract'
    }
  },
  account: {
    balance: 'Balance',
    account_list: 'Account List',
    total_balance: 'Total Balance',
    mondify_name: 'modify account name',
    btn: {
      transfer: 'transfer',
      backupAccount: 'backup',
      add: 'new account',
      importAccount: 'import account'
    },
    copy: {
      alert: 'alert：copy address',
      content:
        'Do you agree to copy the account address to the system clipboard？',
      success: 'copy address success!'
    },
    create: {
      title: 'create a new address',
      text1: 'set a password for your account.',
      text2:
        'Please remember your password. If you forget the password, there will be no way to retrieve it.',
      password_tip1:
        'The password of account must not be less than 8 characters',
      password_msg1: 'enter password',
      password_tip2: 'Entered passwords differ, please try again.',
      password_msg2: 'confirm password'
    }
  },
  tx: {
    list: {
      caption: 'Recent Transaction',
      unconfirmed: 'confirming',
      block_confirm: 'blocks confirmed'
    },
    text: {
      noTxs: 'No transaction history'
    },
    transfer: {
      from_error: 'Please choose an account for transfer',
      from_label: 'transfer out account',
      to_error: 'not a legal address',
      to_label: 'transfer in account',
      balance_error: 'The transfer amount must be greater than 0',
      balance_label: 'transfer amount',
      balance: 'balance',
      fee: 'estimated service charge',
      btn: 'confirm',
      insufficient_funds: 'Insufficient funds',
      transaction_detail: 'Transaction Details',
      block_number: 'blockNumber',
      from: 'from',
      to: 'to',
      transaction_hash: 'transactionHash',
      confirm: {
        title: 'transfer confirm',
        transfer_amount: 'transfer amount',
        fee: 'service charge',
        total: 'total amount',
        enter_pwd: 'enter password',
        wrong_pwd: 'wrong password!'
      }
    }
  },
  splash: {
    downloading: {
      title: 'Ozone is initializing ...'
    },
    syncing: {
      title: 'Ozone is syncing chaindata ...'
    }
  }
}
