<template>
  <q-page class="q-pa-md">
    <div class="q-subheading">{{ $t('contract.add.description') }}</div>
    <div class="bg-white q-pa-md q-mt-md">
      <div class="q-mt-md">
        <q-field :error-label="$t('contract.add.name.error')"
                 :error="$v.contract.name.$error">
          <q-input :float-label="$t('contract.add.name.label')"
                   v-model="contract.name"
                   type="text"
                   @blur="$v.contract.name.$touch"
                   :placeholder="$t('contract.add.name.placeholder')" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-field :error-label="contract.add.abi.error"
                 :error="$v.contract.abi.$error">
        <q-input v-model="contract.abi"
                 :float-label="$t('contract.add.abi.label')"
                 type="textarea"
                 :max-height="200"
                 rows="5"
                 class="code"
                 @blur="$v.contract.abi.$touch"
                 :placeholder="$t('contract.add.abi.placeholder')" />
        </q-field>
      </div>

      <div class="q-mt-md">
        <q-field :error-label="$t('contract.add.address.error')"
                 :error="$v.contract.address.$error">
          <q-input :float-label="$t('contract.add.address.label')"
                   v-model="contract.address"
                   type="text"
                   @blur="$v.contract.address.$touch"
                   :placeholder="$t('contract.add.address.placeholder')" />
        </q-field>
      </div>

    </div>

    <div class="row q-mt-md justify-center">
      <q-btn color="tertiary"
            :label="$t('contract.add.btn.cancel')"
            @click="$router.go(-1)" />

      <q-btn color="primary q-ml-lg"
            :label="$t('contract.add.btn.ok')"
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
          this.$q.notify({message: this.$t('contract.add.notify.exists')})
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
    this.$store.commit('ui/update', {
      breadcrumbs: [
        { key: 'nav.contract.my.label', to: '/contract/my' },
        { key: 'nav.contract.my.add' }
      ]
    })

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
