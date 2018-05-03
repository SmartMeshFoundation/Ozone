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
                  v-model="advanced"
                  label="高级模式" />
      </div>
      <div class="q-mt-md">
        <q-field :error="hasError"
                 error-label="源码分析发生错误:">
          <q-input v-model="form.source"
                   type="textarea"
                   :max-height="200"
                   rows="5"
                   class="code"
                   :class="{hidden: advanced}"
                   placeholder="在这里粘贴 Solidity 源码" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-input v-model="form.abi"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 :class="{hidden: !advanced}"
                 placeholder="在这里粘贴智能合约的 ABI" />
      </div>
      <div class="q-mt-md">
        <q-input v-model="form.bytecode"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 :class="{hidden: !advanced}"
                 placeholder="在这里粘贴智能合约的 字节码" />
      </div>

      <div class="q-mt-md">
        <q-alert v-for="(item, index) in messages"
                 :key="'msg-'+index"
                 :type="errorType(item)"
                 class="q-mb-sm">
          {{item}}
        </q-alert>
      </div>

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
        bytecode: ''
      },
      messages: [],
      hasError: false,
      advanced: false,
      visible: true
    }
  },
  methods: {
    compile: _.debounce(function (source) {
      let output = ipc.sendSync(Types.UI_ACTION_COMPILE_SYNC, source)
      console.log('output: ', output)

      this.messages.splice(0, this.messages.length)
      let errorFlag = false
      if (output.errors && output.errors.length > 0) {
        output.errors.forEach(error => {
          if (error.indexOf('Error') >= 0) errorFlag = true
          this.messages.push(error)
        })
      }
      this.hasError = errorFlag
    }, 600),
    errorType (msg) {
      if (msg.indexOf('Warn') >= 0) {
        return 'warning'
      } else if (msg.indexOf('Error') >= 0) {
        return 'negative'
      } else {
        return 'info'
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
    }
  },
  watch: {
    'form.source' (newVal, oldVal) {
      if (newVal && newVal.trim().length > 0) {
        this.compile(newVal)
      }
    }
  },
  validations: {
    form: {
      from: { required }
    }
  },
  created () {
    //
  }
}
</script>
