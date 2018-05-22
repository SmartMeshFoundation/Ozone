<template>
  <q-page class="q-pa-md">
    <q-alert type="info">
      添加已经部署到链上的合约到 '我的合约' 中
    </q-alert>
    <div class="bg-white q-pa-md q-mt-md">
      <div class="q-mt-md">
        <q-field error-label="请输入合约名称"
                 :error="$v.contract.name.$error">
          <q-input float-label="合约名称"
                   v-model="contract.name"
                   type="text"
                   @blur="$v.contract.name.$touch"
                   placeholder="自定义合约的名称" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-field error-label="合约的 ABI 不能为空"
                 :error="$v.contract.abi.$error">
        <q-input v-model="contract.abi"
                 float-label="智能合约的 ABI"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 @blur="$v.contract.abi.$touch"
                 placeholder="json interface" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-field error-label="非法的合约地址"
                 :error="$v.contract.address.$error">
          <q-input float-label="合约地址"
                   v-model="contract.address"
                   type="text"
                   @blur="$v.contract.address.$touch"
                   placeholder="0x00000f..." />
        </q-field>
      </div>

    </div>

    <div class="row q-mt-md justify-center">
      <q-btn color="tertiary"
            label=" 取 消 "
            @click="$router.go(-1)" />

      <q-btn color="primary q-ml-lg"
            label=" 添加合约 "
            @click="addContract" />
    </div>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { address } from '../validators'
import { Types } from '../../src-electron/modules/ipc/types'

const ipc = window.ipc
const db = window.db

export default {
  data () {
    return {
      contract: {
        name: '',
        abi: '',
        address: ''
      }
    }
  },

  methods: {
    addContract () {
      this.$v.contract.$touch()
      if (!this.$v.contract.$error) {
        let exist = db.contracts.find({'contractAddress': this.contract.address})
        if (exist.length === 0) {
          this.$q.loading.show()
          ipc.send(Types.ADD_CONTRACT, this.contract)
        } else {
          this.$q.notify({message: '合约地址已经存在！'})
        }
      }
    }
  },

  computed: {
  },

  validations () {
    return {
      contract: {
        name: { required },
        abi: { required },
        address: { required, address }
      }
    }
  },

  created () {
    ipc.on(Types.ADD_CONTRACT_REPLY, (event, data) => {
      this.$q.loading.hide()

      if (data && data.error) {
        this.$q.notify(data.error)
      } else {
        this.$router.push('/contract/my')
      }
    })
  },

  destroyed () {
    ipc.removeAllListeners(Types.ADD_CONTRACT_REPLY)
  }
}
</script>
