<template>
    <q-page class="q-pa-md">
        <div class="row bg-white q-pa-md">
            <div class="col">
                <span class="q-title">Contract Name</span>
                <span class="q-subheading address">contract address</span>
            </div>
        </div>

        <div class="row q-mt-sm gutter-sm">
            <div class="col-sm-12 col-md-4">
                <q-table title="合约状态"
                         :data="tableData"
                         :columns="columns"
                         row-key="name"
                         class="bg-white">

                    <div slot="bottom"
                         slot-scope="props"
                         class="row flex-center fit">
                        <q-btn round
                               dense
                               flat
                               icon="chevron_left"
                               color="secondary"
                               class="q-mr-md"
                               :disable="props.isFirstPage"
                               @click="props.prevPage" />
                        <q-btn round
                               dense
                               flat
                               icon="chevron_right"
                               color="secondary"
                               :disable="props.isLastPage"
                               @click="props.nextPage" />
                    </div>
                </q-table>
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
                :key="uid(msg)">{{msg}}</li>
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
</style>

<script>
import moment from 'moment'
import uuidv4 from 'uuid/v4'

export default {
  data () {
    return {
      messages: [],
      columns: [
        { name: 'name', label: 'Name', field: 'name', align: 'left' },
        { name: 'value', label: 'Value', field: 'value', align: 'right' }
      ]
    }
  },

  methods: {
    addMessage (msg) {
      this.messages.push('[' + moment().format('HH:mm:ss.SSS') + ']: ' + msg)
    },

    uid () {
      return uuidv4()
    }
  },

  computed: {
    tableData () {
      return [
        { name: 'minter', value: '0x000abcdef...' },
        { name: 'initial', value: '10000' },
        { name: 'balances', value: '2000000' }
      ]
    }
  },

  created () {
    console.log('id: ', this.$route.query.id)
    this.addMessage('one line')
    this.addMessage('two line')
    this.addMessage('three line')
  },

  destroyed () {}
}
</script>
