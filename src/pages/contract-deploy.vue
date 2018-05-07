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
        <q-input v-model="form.abi"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 :class="{hidden: !advancedMode}"
                 placeholder="在这里粘贴智能合约的 ABI" />
      </div>
      <div class="q-mt-md">
        <q-input v-model="form.bytecode"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 :class="{hidden: !advancedMode}"
                 placeholder="在这里粘贴智能合约的 字节码" />
      </div>
      <div>
        <q-field error-label="请选择需要发布的合约"
                 :error="$v.form.deployedContract.$error">
          <q-select float-label="合约名称"
                    v-model="form.deployedContract"
                    :options="contractNames" />
        </q-field>
      </div>

      <div v-if="hasConstractor">
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
      <q-btn
        color="primary"
        label=" 发布合约 "
        @click="deploy" />
    </div>
  </q-page>
</template>

<style>

</style>

<script>
import { required } from 'vuelidate/lib/validators'
import _ from 'lodash'
import { ipcRenderer as ipc } from 'electron'
import { Types } from '../../src-electron/modules/ipc/types'

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
      hasConstractor: false,
      args: '',
      argsPlaceholder: ''
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

    deploy () {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        // TODO send transaction
      }
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
          return {label: name, value: name}
        })
      }
      return options
    }

  },

  watch: {
    'form.source' (newVal, oldVal) {
      this.messages.splice(0, this.messages.length)
      this.hasError = false

      if (newVal && newVal.trim().length > 0) {
        this.compile(newVal)
      }
    }
  },

  validations () {
    if (this.advancedMode) {
      return {
        form: {
          from: { required },
          abi: { required },
          bytecode: { required }
        }
      }
    } else {
      return {
        form: {
          from: { required },
          deployedContract: { required }
        }
      }
    }
  }
}
</script>
