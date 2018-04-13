<template>
  <q-item :to="to" >
    <q-item-side>
      <ident-icon :value="account.address.toLowerCase()" />
    </q-item-side>
    <q-item-main>
      <q-item-tile>
        <strong>{{account.name}}</strong>
      </q-item-tile>
      <q-item-tile class="address">{{account.address}}
        <q-icon name="content_copy"
                @click.native.stop="copyAddress(account.address)" /> </q-item-tile>
    </q-item-main>
    <q-item-side right>
      <q-item-tile>余额</q-item-tile>
      <q-item-tile>
        <ani-number :value="account.ether" /> </q-item-tile>
    </q-item-side>
  </q-item>
</template>

<script>
const copy = require('clipboard-copy')

export default {
  name: 'AccountItem',
  props: {
    account: {
      required: true
    },
    to: {
      type: String
    }
  },
  methods: {
    copyAddress (address) {
      this.$q.dialog({
        title: '警告：拷贝地址',
        message: '你同意拷贝账户地址到系统剪切板吗？',
        color: 'secondary'
      }).then(() => {
        copy(address).then(() => {
          this.$q.notify({ message: '拷贝地址成功！', color: 'secondary' })
        })
      })
    }
  }
}
</script>
