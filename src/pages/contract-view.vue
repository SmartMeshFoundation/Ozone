<template>
    <q-page class="q-pa-md">
        <div class="row bg-white q-pa-md">
            <div class="col">
                <span class="q-title">{{contract.name}}</span>
                <span class="q-subheading address">{{contract.contractAddress}}</span>
            </div>
        </div>

        <div class="row q-mt-sm gutter-sm">
            <div class="col-sm-12 col-md-4">
                <q-list class="bg-white"
                        separator>
                    <q-list-header>合约状态</q-list-header>
                    <q-item v-for="state in states"
                            :key="state.name">
                        <q-item-main>
                            <q-item-tile>
                                <q-btn dense
                                       :label="state.name"
                                       @click="callContract(state.name)"
                                       title="call"
                                       color="secondary"
                                       class="shadow-1" />
                                <q-input class="inputs"
                                         v-if="state.inputs.length > 0"
                                         v-model="methodInputs[state.name]"
                                         :placeholder="state.inputs[0].type" />
                            </q-item-tile>
                            <q-item-tile v-for="(item, idx) in results[state.name]"
                                         :key="uuid(idx)">
                                <small>{{idx}}: {{item.type}}: {{item.value}}</small>
                            </q-item-tile>
                        </q-item-main>
                    </q-item>
                </q-list>
            </div>

            <div class="col-sm-12 col-md-8">
                <div class="method">
                    <div>Method selector</div>
                    <div>arg1</div>
                    <div>arg2</div>
                    <div>call button</div>
                </div>
            </div>
        </div>

        <ul class="output q-py-sm">
            <li v-for="msg in messages"
                :key="uuid(msg)">{{msg}}</li>
        </ul>

    </q-page>
</template>

<style lang="stylus">
.method, .field {
  background-color: #ffffff;
  padding: 16px;
}

.output {
  background-color: #ffffff;
}

.output > li {
  padding: 5px 0px;
}

.inputs {
  padding-bottom: 4px;
  font-size: 13px;
}
</style>

<script>
import moment from 'moment'
import uuidv4 from 'uuid/v4'

import { Types } from '../../src-electron/modules/ipc/types.js'

const ipc = window.ipc
const web3 = window.web3

export default {
  data () {
    return {
      messages: [],
      from: '',
      password: '',
      methodInputs: {},
      values: {
        minter: []
      }
    }
  },

  methods: {
    addMessage (msg) {
      this.messages.push('[' + moment().format('HH:mm:ss.SSS') + ']: ' + msg)
    },

    uuid () {
      return uuidv4()
    },

    callContract (name) {
      // ipc.send(Types.CALL_CONTRACT, data)
      let abi = JSON.parse(this.contract.abi)

      let myContract = new web3.eth.Contract(abi, this.contract.contractAddress)
      let method = myContract.options.jsonInterface.find(item => {
        return item.name === name
      })

      if (method.constant) {
        myContract.methods[method.signature]().call()
          .then(result => {
            console.log('called result: ', result)

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

            Object.assign(this.values, {[name]: values})
            console.log(this.results)
          })
      }
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
      let items = []
      this.abi.forEach(item => {
        if (item.constant) {
          items.push({
            name: item.name,
            inputs: item.inputs
          })
        }
      })
      return items
    },

    results () {
      return this.values
    }
  },

  created () {
    console.log('id: ', this.$route.query.id)
    // this.addMessage('one line')
    // this.addMessage('two line')
    // this.addMessage('three line')
    ipc.on(Types.CALL_CONTRACT_REPLY, (event, data) => {
      if (data.error) {
        this.addMessage(data.error)
      }
    })
  },

  destroyed () {
    ipc.removeAllListeners(Types.CALL_CONTRACT_REPLY)
  }
}
</script>
