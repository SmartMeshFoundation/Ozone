<template>
  <q-page class="q-pa-md">
    <div class="bg-white q-pa-md">
      <div>
        <q-field error-label="请选择发布合约的账户"
                 :error="$v.form.from.$error">
          <q-select float-label="合约所有者"
                    v-model="form.from"
                    :options="options" />
        </q-field>
      </div>
      <div class="q-mt-lg">
        <q-field error-label="金额必须是数字"
                 :error="$v.form.value.$error">
          <q-input float-label="金额"
                   v-model="form.value"
                   type="number" />
        </q-field>
      </div>
      <div class="q-mt-lg">
        <q-toggle class="q-ma-xs"
                  v-model="advancedMode"
                  label="高级模式" />
      </div>
      <div class="q-mt-md relative-position">
        <q-field :error="hasError"
                 error-label="源码分析发生错误:">
          <q-input v-model="form.source"
                   type="textarea"
                   :max-height="200"
                   rows="5"
                   class="code"
                   :class="{hidden: advancedMode}"
                   placeholder="在这里粘贴 Solidity 源码" />
        </q-field>
        <!-- <q-inner-loading :visible="isCompiling" /> -->
      </div>
      <!-- error messages -->
      <div class="q-mt-md">
        <q-alert v-for="(item, index) in messages"
                 :key="'msg-'+index"
                 :type="messageType(item)"
                 class="q-mb-sm">
          {{item}}
        </q-alert>
      </div>
      <!-- error messages -->

      <div class="q-mt-md">
        <q-field error-label="合约的 ABI 不能为空"
                 :error="$v.form.abi.$error">
        <q-input v-model="form.abi"
                 float-label="智能合约的 ABI"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 placeholder="json interface" />
        </q-field>
      </div>
      <div class="q-mt-md">
        <q-field error-label="合约的 字节码 不能为空"
                 :error="$v.form.bytecode.$error">
        <q-input v-model="form.bytecode"
                 float-label="智能合约的 字节码"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 placeholder="0x......" />
        </q-field>
      </div>
      <div class="q-mt-md" v-if="!advancedMode">
        <q-field error-label="请选择需要发布的合约"
                 :error="$v.form.deployedContract.$error">
          <q-select float-label="合约名称"
                    v-model="form.deployedContract"
                    :options="contractNames" />
        </q-field>
      </div>

      <div class="q-mt-md" v-if="hasConstructor">
        <q-field>
          <q-input float-label="构造参数"
                   v-model="args"
                   type="text"
                   :placeholder="argsPlaceholder" />
        </q-field>
      </div>

    </div>

    <div class="row q-mt-md justify-end">
      <q-btn color="primary"
             label=" 创建合约 "
             @click="checkForm" />
    </div>

    <q-modal v-model="showConfirmModal"
             minimized
             :content-css="{padding: '20px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-display-1">确认部署合约</div>
      </div>

      <div class="row q-pa-md">
        <div class="col">合约所有者：</div>
        <div>{{form.from}}</div>
      </div>

      <div class="row q-pa-md" v-if="hasConstructor">
        <div class="col">构造参数: </div>
        <div>{{args}}</div>
      </div>

      <div class="row q-pa-md">
        <div class="col">
          <q-input type="password" v-model="password" placeholder="输入合约所有者的账户密码" />
        </div>
      </div>

      <div class="row q-pa-md gutter-md justify-end">
        <div>
          <q-btn color="tertiary"
                 @click="showConfirmModal = false"
                 :label="$t('button.cancel')" />
        </div>
        <div>
          <q-btn color="primary"
                 :label="$t('button.ok')"
                 @click="createContract" />
        </div>
      </div>
    </q-modal>
  </q-page>
</template>

<style>

</style>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators'
import _ from 'lodash'
import { ipcRenderer as ipc } from 'electron'
import { Types } from '../../src-electron/modules/ipc/types'
import { number } from '../validators'

const web3 = window.web3

export default {
  data () {
    return {
      showConfirmModal: false,
      form: {
        from: '',
        value: 0,
        amount: '',
        source: '',
        abi: '',
        bytecode: '',
        deployedContract: ''
      },
      contracts: {},
      messages: [],
      hasError: false,
      advancedMode: false,
      hasConstructor: false,
      args: '',
      argsPlaceholder: '',
      password: ''
    }
  },
  methods: {
    compile: _.debounce(function (source) {
      let output = ipc.sendSync(Types.UI_ACTION_COMPILE_SYNC, source)
      console.log('compile output: ', output)

      let errorFlag = false
      if (output.errors && output.errors.length > 0) {
        output.errors.forEach(error => {
          if (error.indexOf('Error') >= 0) {
            errorFlag = true
            this.messages.push(error)
          }
        })
      }
      this.hasError = errorFlag

      if (!this.hasError) {
        this.contracts = output.contracts
      }
    }, 600),

    messageType (msg) {
      if (msg.indexOf('Warn') >= 0) {
        return 'warning'
      } else if (msg.indexOf('Error') >= 0) {
        return 'negative'
      } else {
        return 'info'
      }
    },

    checkForm () {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        this.showConfirmModal = true
      }
    },

    // deploy the smart contract to chain
    createContract () {
      this.showConfirmModal = false
      this.$q.loading.show()

      web3.eth.personal.unlockAccount(this.form.from, this.password)
        .then(() => {
          let data = {
            from: this.form.from,
            value: this.form.value,
            abi: this.form.abi,
            bytecode: this.form.bytecode,
            args: this.args
          }

          ipc.send(Types.DEPLOY_CONTRACT, data)
        })
        .catch((err) => {
          console.log(err)
          this.$q.loading.hide()
          this.$q.notify('账户密码错误')
        })
    },

    updateArguments (abi) {
      this.hasConstructor = false

      try {
        abi = JSON.parse(abi)
      } catch (error) {
        return
      }

      abi.forEach(method => {
        if (method.type === 'constructor') {
          if (method.inputs.length > 0) {
            let args = method.inputs.map(input => {
              return input.type + ' ' + input.name
            })
            this.argsPlaceholder = args.join(', ')
            this.hasConstructor = true
          }
        }
      })
    }
  },

  computed: {
    options () {
      let accounts = this.$store.state.account.list
      let options = accounts.map(account => {
        return {
          label: account.name,
          sublabel: account.address,
          value: account.address,
          avatar: this.$icon(account.address.toLowerCase())
        }
      })
      return options
    },

    contractNames () {
      let names = _.keys(this.contracts)
      let options = []
      if (names.length > 0) {
        options = names.map(name => {
          return { label: name, value: name }
        })
      }
      return options
    },

    gasPrice () {
      return this.$store.state.node.gasPrice
    }

  },

  watch: {
    'form.source' (newVal, oldVal) {
      this.messages.splice(0, this.messages.length)
      this.hasError = false
      this.hasConstructor = false

      if (newVal && newVal.trim().length > 0) {
        this.compile(newVal)
      }
    },

    'form.deployedContract' (newVal, oldVal) {
      if (newVal && newVal.trim() !== '') {
        let contract = this.contracts[newVal]
        this.form.abi = contract.interface
        this.form.bytecode = contract.bytecode

        this.updateArguments(contract.interface)
      }
    },

    'form.bytecode': _.debounce(function (newVal, oldVal) {
      if (newVal.length > 0 && !web3.utils.isHex(newVal)) {
        this.form.bytecode = ''
        return
      }

      if (newVal.length > 0 && !newVal.startsWith('0x')) {
        this.form.bytecode = '0x' + newVal
      }
    }, 400),

    'form.abi': _.debounce(function (newVal, oldVal) {
      if (this.advancedMode) {
        this.updateArguments(newVal)
      }
    }, 400)
  },

  validations () {
    return {
      form: {
        from: { required },
        value: { number },
        abi: {
          required: requiredIf(function (model) {
            return this.advancedMode
          })
        },
        bytecode: {
          required: requiredIf(function (model) {
            return this.advancedMode
          })
        },
        deployedContract: {
          required: requiredIf(function (model) {
            return !this.advancedMode
          })
        }
      }
    }
  },

  created () {
    ipc.on(Types.DEPLOY_CONTRACT_REPLY, (event, data) => {
      this.$q.loading.hide()

      if (data.error) {
        this.$q.loading.hide()
        this.$q.notify(data.error)
      } else {
        this.$router.push('/dashboard')
      }
    })
  },

  destroyed () {
    ipc.removeAllListeners(Types.DEPLOY_CONTRACT_REPLY)
  }
}
</script>
