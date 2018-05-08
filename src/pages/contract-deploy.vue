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

      <div class="q-mt-md">
        <q-field error-label="合约的 ABI 不能为空"
                 :error="$v.form.abi.$error">
        <q-input v-model="form.abi"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 placeholder="在这里粘贴智能合约的 ABI" />
        </q-field>
      </div>
      <div class="q-mt-md">
        <q-field error-label="合约的 字节码 不能为空"
                 :error="$v.form.bytecode.$error">
        <q-input v-model="form.bytecode"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 placeholder="在这里粘贴智能合约的 字节码" />
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
        <div class="col">预计费用: </div>
        <div>{{estimatedFee}} {{$unit}}</div>
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
import BigNumber from 'bignumber.js'
const BN = BigNumber
const web3 = window.web3

export default {
  data () {
    return {
      showConfirmModal: false,
      form: {
        from: '',
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
      estimatedGas: 0,
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
      console.log('call createContract')

      let myContract = new web3.eth.Contract(JSON.parse(this.form.abi))
      let tx = myContract.deploy({
        data: this.form.bytecode.indexOf('0x') < 0 ? '0x' + this.form.bytecode : this.form.bytecode,
        arguments: [0, 'test']
      })

      tx.estimateGas()
        .then(gas => {
          web3.eth.personal.unlockAccount(this.form.from, this.password)
            .then(() => {
              let options = {
                from: this.form.from,
                gas,
                gasPrice: this.gasPrice
              }
              console.log('send options: ', options)

              tx.send(options)
                .on('transactionHash', (hash) => {
                  console.log('deploy contract tx hash: ', hash)
                  this.$q.loading.hide()
                  this.$router.push('/dashboard')
                })
                .catch((err) => {
                  console.log(err)
                  this.$q.loading.hide()
                  this.$q.notify('合约发布失败')
                })
            })
            .catch((err) => {
              console.log(err)
              this.$q.loading.hide()
              this.$q.notify('账户密码错误')
            })
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
    },

    estimatedFee () {
      return web3.utils.fromWei(new BN(this.estimatedGas).times(this.gasPrice).toFixed())
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
      if (newVal && newVal !== '') {
        let contract = this.contracts[newVal]
        this.form.abi = contract.interface
        this.form.bytecode = '0x' + contract.bytecode

        let abi = JSON.parse(contract.interface)

        abi.forEach(api => {
          if (api.type === 'constructor') {
            if (api.inputs.length > 0) {
              this.hasConstructor = true

              let args = api.inputs.map(input => {
                return input.type + ' ' + input.name
              })
              this.argsPlaceholder = args.join(', ')
            }
          }
        })

        this.estimatedGas = contract.gasEstimates.creation.reduce((prev, curr) => {
          return prev + curr
        }, 0)
      }
    }
  },

  validations () {
    return {
      form: {
        from: { required },
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
  }
}
</script>
