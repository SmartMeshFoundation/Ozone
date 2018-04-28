<template>
  <q-page class="q-pa-lg gutter-md">
    <div class="row gutter-md">
      <div class="col-12">
        <q-field error-label="请选择发布合约的账户"
                 :error="$v.form.from.$error">
          <q-select float-label="合约所有者"
                    v-model="form.from"
                    :options="options" />
        </q-field>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { required, numeric } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      showConfirmModal: false,
      form: {
        from: '',
        to: '',
        amount: ''
      },
      // balance: 0,
      gasFee: 0,
      total: 0,
      disabled: false
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
  validations: {
    form: {
      from: { required },
      amount: { required, numeric }
    }
  },
  created () {
    this.$emit('updateToolbar', '部署合約', 'code')
  }
}
</script>
