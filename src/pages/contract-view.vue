<template>
    <q-page class="q-pa-md">
        <div class="row bg-white q-pa-md">
            <div class="col">
                <span class="q-title">{{contract.name}}</span>
                <span class="q-subheading address">{{contract.contractAddress}}</span>
            </div>
        </div>

        <div class="row q-mt-sm gutter-sm">
            <div class="col-sm-12 col-md-6">
                <q-list class="bg-white"
                        separator>
                    <q-list-header>{{$t('contract.view.status')}}</q-list-header>
                    <q-item v-for="state in states"
                            :key="state.name">
                      <q-item-side>
                        <q-btn :label="state.name" dense
                                @click="callContract(state.name)"
                                title="call"
                                color="secondary"
                                class="shadow-1" />
                      </q-item-side>
                        <q-item-main>
                            <q-item-tile>
                                <q-input class="inputs"
                                         v-for="input in methodInputs[state.name]"
                                         v-model="input.value"
                                         :key="state.name + '-input-'+input.pos"
                                         :placeholder="'Input ' +input.pos + ': ' + input.type" />
                            </q-item-tile>
                            <q-item-tile class="output" v-for="(item, idx) in returnValues[state.name]"
                                         :key="uuid(idx)">
                                <small>Output {{idx}}: {{item.type}}: {{item.value}}</small>
                            </q-item-tile>
                        </q-item-main>
                    </q-item>
                </q-list>
            </div>

            <div class="col-sm-12 col-md-6">
                <q-list class="bg-white"
                        separator>
                    <q-list-header>{{$t('contract.view.methods')}}</q-list-header>
                    <q-item>
                      <q-item-main>
                        <q-item-tile>
                          <q-select :float-label="$t('contract.view.from_label')"
                                    hide-underline
                                    v-model="from"
                                    :options="getAccounts()" />
                        </q-item-tile>
                      </q-item-main>
                    </q-item>
                    <q-item v-for="method in methods"
                            :key="method.name">
                        <q-item-side>
                            <q-btn :label="method.name" dense
                                    @click="callContract(method.name)"
                                    title="transact"
                                    color="red-3"
                                    class="shadow-1" />
                        </q-item-side>
                        <q-item-main>
                            <q-item-tile>
                                <q-input class="inputs"
                                         v-for="input in methodInputs[method.name]"
                                         v-model="input.value"
                                         :key="method.name + '-input-'+input.pos"
                                         :placeholder="'Input ' +input.pos + ': ' + input.type" />
                            </q-item-tile>
                        </q-item-main>
                    </q-item>
                </q-list>
            </div>
        </div>

        <q-table class="bg-white q-mt-lg"
          :data="pastEvents"
          :columns="eventColumns"
          row-key="name"
          color="secondary"
          :loading="loading"
        >
          <template slot="top-left" slot-scope="props">
            <q-input :placeholder="$t('contract.view.from_block')" v-model="fromBlock" class="q-mr-md"></q-input>
            <q-btn :disable="loading" :label="$t('contract.view.btn_query')" color="secondary" @click="getPastEvents"></q-btn>
          </template>
        </q-table>

        <q-table class="bg-white q-mt-lg"
          :data="watchedEvents"
          :columns="eventColumns"
          row-key="name"
          color="secondary"
        >
          <template slot="top-left" slot-scope="props">
            <q-btn :loading="watching" :label="$t('contract.view.btn_watch')" color="secondary" @click="watchEvents"></q-btn>
          </template>
        </q-table>

        <ul class="messages q-py-sm" v-if="messages.length > 0">
            <li v-for="msg in messages" :class="{error: !!msg.error}"
                :key="uuid(msg)">{{msg.message}}</li>
        </ul>

      <q-modal class="password-modal" v-model="showPasswordModal">
        <div class="q-pa-md">
          <p class="q-headline">{{ $t('contract.view.dialog.title') }}</p>
          <p class="modify-account-name"><q-input type="password" :placeholder="$t('contract.view.dialog.message')" v-model="password"/></p>
          <p class="modify-account-name">gasLimit: {{gas}}</p>
          <p class="modify-account-name"><q-slider v-model="gas" :min="minGas" :max="maxGas" /></p>
          <q-btn :label="$t('button.cancel')"
                 color="primary"
                 class="q-my-md cancel-btn"
                 @click="cancel" />
          <q-btn :label="$t('button.ok')"
                 color="primary"
                 class="q-my-md sub-btn"
                 @click="submit" />
        </div>
      </q-modal>

    </q-page>
</template>

<style lang="stylus">
.method, .field {
  background-color #ffffff
  padding          16px
}

.inputs {
  padding-bottom 4px
  font-size 13px
}

.messages {
  background-color #ffffff
}

.messages > li {
  padding   5px 0px
  font-size 13px
}

.messages > li.error {
  color #FF0000
}
</style>

<script>
import moment from 'moment'
import uuidv4 from 'uuid/v4'
import BigNumber from 'bignumber.js'
// import _ from 'lodash'

// import { Types } from '../../src-electron/modules/ipc/types.js'

// const ipc = window.ipc
const web3 = window.web3

export default {
  data () {
    return {
      showPasswordModal: false,
      messages: [],
      from: this.getAccounts()[0].value,
      methodInputs: this.getMethodInputs(),
      returnValues: this.getReturnValues(),
      fromBlock: '',
      pastEvents: [],
      eventColumns: [
        {name: 'id', label: this.$t('contract.view.column.block_number'), field: 'blockNumber', align: 'left'},
        {name: 'event', label: this.$t('contract.view.column.event'), field: 'event'},
        {name: 'returnValues', label: this.$t('contract.view.column.return_val'), field: 'returnValues', align: 'left'}
      ],
      watchedEvents: [],
      watching: false,
      loading: false,
      minGas: 0,
      maxGas: 1,
      password: '',
      execMethod: {},
      gas: 0
    }
  },

  methods: {
    addMessage (msg, error) {
      this.messages.push({
        message: '[' + moment().format('HH:mm:ss.SSS') + ']: ' + msg,
        error
      })
    },

    uuid () {
      return uuidv4()
    },

    getAccounts () {
      let list = this.$store.state.account.list
      let options = list.map(account => {
        return {
          label: account.name,
          sublabel: account.address,
          value: account.address,
          avatar: this.$icon(account.address.toLowerCase())
        }
      })
      return options
    },

    getMethodInputs () {
      let abi = JSON.parse(this.$store.getters['contract/get'](this.$route.query.id).abi)
      let inputs = {}
      abi.forEach(item => {
        if (item.type === 'function' && item.inputs && item.inputs.length > 0) {
          inputs[item.name] = []
          item.inputs.forEach((input, idx) => {
            inputs[item.name].push({pos: idx, type: input.type, value: ''})
          })
        }
      })
      // console.log('method inputs: ', inputs)
      return inputs
    },

    getReturnValues () {
      let abi = JSON.parse(this.$store.getters['contract/get'](this.$route.query.id).abi)
      let values = {}
      abi.forEach(item => {
        if (item.constant) {
          values[item.name] = []
        }
      })
      return values
    },

    // parse arguments of methods
    parseInputs (name) {
      if (!this.methodInputs[name]) {
        return null
      }
      let inputs = []
      this.methodInputs[name].forEach(input => {
        let type = input.type
        let value = input.value
        if (type.startsWith('uint') || type.startsWith('int')) {
          if (value.trim().length === 0) {
            value = 0
          }
          inputs.push(new BigNumber(value).toFixed())
        } else {
          inputs.push(value)
        }
      })
      return inputs
    },

    // call or send method of the contract
    callContract (name) {
      let myContract = new web3.eth.Contract(this.abi, this.contract.contractAddress)
      let method = myContract.options.jsonInterface.find(item => {
        return item.name === name
      })

      let execMethod
      let inputs = this.parseInputs(name)
      console.log('inputs: ', inputs)

      if (inputs == null) {
        execMethod = myContract.methods[method.signature]()
      } else {
        execMethod = myContract.methods[method.signature](...inputs)
      }
      if (method.constant) {
        execMethod.call()
          .then(result => {
            this.handleResult(method, result)
          })
          .catch((error) => {
            this.addMessage(error.message)
          })
      } else {
        this.showPasswordModal = true
        Promise.all([
          execMethod.estimateGas(),
          web3.eth.getGasPrice()
        ])
          .then(([gas, price]) => {
            this.minGas = gas
            this.maxGas = gas * 5
            this.gas = this.minGas
            console.log(this.maxGas, this.minGas)
            this.execMethod = execMethod
          })
          .catch(error => { this.addMessage(error, true) })
      }
    },

    cancel () {
      this.showPasswordModal = false
      this.password = ''
    },

    submit () {
      web3.eth.personal.unlockAccount(this.from, this.password)
        .then(() => {
          this.execMethod.send({from: this.from, gas: this.gas}, (error, transactionHash) => {
            if (!error) {
              this.addMessage('Send transaction hash: ' + transactionHash)
            } else {
              this.addMessage('Send transaction error: ' + error, true)
            }
          })
          web3.eth.personal.lockAccount(this.from)
        }).catch((error) => {
          this.addMessage(error, true)
          web3.eth.personal.lockAccount(this.from)
        })
      this.cancel()
    },

    handleResult (method, result) {
      console.log('called result of ', method.name, ': ', result)
      let values = []
      let outputs = method.outputs
      if (outputs.length > 1) {
        for (let i = 0; i < outputs.length; i++) {
          values.push({
            type: outputs[i].type,
            value: result[i]
          })
        }
      } else {
        values.push({
          type: outputs[0].type,
          value: result
        })
      }
      this.returnValues[method.name] = values
    },

    getPastEvents () {
      this.loading = true
      this.pastEvents.splice(0, this.pastEvents.length)
      let myContract = new web3.eth.Contract(this.abi, this.contract.contractAddress)
      let fromBlock = this.fromBlock
      fromBlock = fromBlock === '' ? 'latest' : fromBlock
      myContract.getPastEvents('allEvents', { fromBlock })
        .then(events => {
          console.log('past events: ', events)

          events.forEach(event => {
            this.pastEvents.push({
              id: event.id,
              event: event.event,
              blockNumber: event.blockNumber,
              returnValues: this.convertValues(event.event, event.returnValues)
            })
          })
          this.loading = false
        })
        .catch(error => {
          this.addMessage(error, true)
          this.loading = false
        })
    },

    watchEvents () {
      if (!this.watching) {
        this.watching = true

        let myContract = new web3.eth.Contract(this.abi, this.contract.contractAddress)
        myContract.events.allEvents((error, event) => {
          if (!error) {
            console.log('fired event: ', event)

            this.watchedEvents.push({
              id: event.id,
              event: event.event,
              blockNumber: event.blockNumber,
              returnValues: this.convertValues(event.event, event.returnValues)
            })
          } else {
            this.addMessage(error, true)
          }
        })
      }
    },

    convertValues (name, obj) {
      let event = this.abi.find(item => item.name === name)

      let values = []
      event.inputs.forEach(item => {
        values.push(item.name + ': ' + obj[item.name])
      })
      // for (let i = 0; i < 10; i++) {
      //   if (obj[i]) {
      //     values.push(obj[i])
      //   } else {
      //     break
      //   }
      // }
      return values.join(', ')
    }
  },

  computed: {
    contract () {
      return this.$store.getters['contract/get'](this.$route.query.id)
    },

    abi () {
      return JSON.parse(this.contract.abi)
    },

    states () {
      let status = []
      this.abi.forEach(item => {
        if (item.constant) {
          status.push({
            name: item.name,
            inputs: item.inputs
          })
        }
      })
      return status
    },

    methods () {
      let methods = []
      this.abi.forEach(item => {
        if (!item.constant && item.type === 'function') {
          methods.push({
            name: item.name,
            inputs: item.inputs
          })
        }
      })
      return methods
    }

  },

  created () {
    // console.log('id: ', this.$route.query.id)
    this.$store.commit('ui/update', {
      breadcrumbs: [
        { key: 'nav.contract.my.label', to: '/contract/my' },
        { key: 'nav.contract.my.view' }
      ]
    })
  },

  destroyed () {
  }
}
</script>
