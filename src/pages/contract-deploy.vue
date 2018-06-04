<template>
  <q-page class="q-pa-md">
    <div class="bg-white q-pa-md">

      <div>
        <q-toggle class="q-ma-xs"
                  v-model="advancedMode"
                  :label="$t('contract.deploy.advancedMode')" />
      </div>
      <div class="q-mt-md relative-position">
        <q-field :error="hasError"
                 :error-label="$t('contract.deploy.source.error')">
          <q-input v-model="form.source"
                   type="textarea"
                   :max-height="200"
                   rows="5"
                   class="code"
                   :class="{hidden: advancedMode}"
                   :placeholder="$t('contract.deploy.source.placeholder')" />
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
        <q-field :error-label="$t('contract.add.abi.error')"
                 :error="$v.form.abi.$error">
        <q-input v-model="form.abi"
                 :float-label="$t('contract.add.abi.label')"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 :placeholder="$t('contract.add.abi.placeholder')" />
        </q-field>
      </div>
      <div class="q-mt-md">
        <q-field :error-label="$t('contract.deploy.bytecode.error')"
                 :error="$v.form.bytecode.$error">
        <q-input v-model="form.bytecode"
                 :float-label="$t('contract.deploy.bytecode.label')"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 :class="{hidden: !advancedMode}"
                 :placeholder="$t('contract.deploy.bytecode.placeholder')" />
        </q-field>
      </div>
      <div class="q-mt-md" v-if="!advancedMode">
        <q-field :error-label="$t('contract.deploy.contract_name.error')"
                 :error="$v.form.contractName.$error">
          <q-select :float-label="$t('contract.deploy.contract_name.label')"
                    v-model="form.contractName"
                    :options="contractNames" />
        </q-field>
      </div>

      <div class="q-mt-md" v-if="hasConstructor">
        <q-field>
          <q-input :float-label="$t('contract.deploy.constructor.label')"
                   v-model="args"
                   type="text"
                   :placeholder="argsPlaceholder" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-field>
          <q-input :float-label="$t('contract.deploy.custom_name.label')"
                   v-model="customName"
                   type="text"
                   :placeholder="$t('contract.deploy.custom_name.placeholder')" />
        </q-field>
      </div>

      <div class="q-mt-lg">
        <q-field :error-label="$t('contract.deploy.from.error')"
                 :error="$v.form.from.$error">
          <q-select :float-label="$t('contract.deploy.from.label')"
                    v-model="form.from"
                    :options="options" />
        </q-field>
      </div>
      <div class="q-mt-lg">
        <q-field :error-label="$t('contract.deploy.value.error')"
                 :error="$v.form.value.$error">
          <q-input :float-label="$t('contract.deploy.value.label')"
                   v-model="form.value"
                   type="number"
                   :suffix="$unit" />
        </q-field>
      </div>

    </div>

    <div class="row q-mt-md justify-center">
      <q-btn color="primary full-width"
             :label="$('contract.deploy.btn.create')"
             @click="checkForm" />
    </div>

    <q-modal v-model="showConfirmModal"
             minimized
             :content-css="{padding: '20px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-display-1">{{ $('contract.deploy.confirm.title') }}</div>
      </div>

      <div class="row items-center q-pa-md">
        <div class="col">
          <ident-icon :value="form.from" />
        </div>
        <div class="q-ml-sm">{{form.from}}</div>
      </div>

      <div class="row q-pa-md" v-if="hasConstructor">
        <div class="col">{{ $t('contract.deploy.constructor.label')}}: </div>
        <div>{{args}}</div>
      </div>

      <div class="row q-pa-md">
        <div class="col">
          <q-input type="password" v-model="password" :placeholder="$t('contract.deploy.confirm.placeholder')" />
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
.v-center {
  position: relative;
  top:50%;
  transform: translateY(-50%);
}
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
        contractName: ''
      },
      contracts: {},
      messages: [],
      hasError: false,
      advancedMode: false,
      hasConstructor: false,
      args: '',
      argsPlaceholder: '',
      password: '',
      customName: '' // custom name of contract
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
    }, 300),

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
            args: this.args,
            name: this.customName
          }

          ipc.send(Types.DEPLOY_CONTRACT, data)
        })
        .catch((err) => {
          console.log(err)
          this.$q.loading.hide()
          this.$q.notify(this.$t('notify.error_password'))
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
          sublabel: account.deploy.ess,
          value: account.deploy.ess,
          avatar: this.$icon(account.deploy.ess.toLowerCase())
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

    'form.contractName' (newVal, oldVal) {
      if (newVal && newVal.trim() !== '') {
        let contract = this.contracts[newVal]
        this.form.abi = contract.interface
        this.form.bytecode = contract.bytecode

        this.updateArguments(contract.interface)

        this.customName = newVal.replace(':', '')
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
        contractName: {
          required: requiredIf(function (model) {
            return !this.advancedMode
          })
        }
      }
    }
  },

  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        {key: 'nav.contract.deploy.label', to: '/contract/deploy'}
      ]
    })

    ipc.on(Types.DEPLOY_CONTRACT_REPLY, (event, data) => {
      this.$q.loading.hide()

      if (data.error) {
        this.$q.loading.hide()
        this.$q.notify(data.error)
      } else {
        this.$router.push('/contract/my')
      }
    })
  },

  destroyed () {
    ipc.removeAllListeners(Types.DEPLOY_CONTRACT_REPLY)
  }
}
</script>
