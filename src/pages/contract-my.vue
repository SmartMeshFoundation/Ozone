<template>
    <q-page class="q-pa-lg">

        <div class="row q-mb-lg contract-op">
          <q-btn-group >
            <q-btn class="contract-in"
                    :label="$t('contract.my.btn.import')"
                    @click="imports" />
            <q-btn class="contract-back"
                    :label="$t('contract.my.btn.backup')"
                    @click="backup" />
            <q-btn class="contract-add"
                    :label="$t('contract.my.btn.add')"
                    @click="$router.push('/contract/my/add')" />
          </q-btn-group>
        </div>

        <div class="row gutter-sm">
            <contract-item v-for="item in contracts"
                           :key="item._id"
                           :item="item" />
        </div>

    </q-page>
</template>

<style lang="stylus">
.row .item
  padding: 18px 10px;
  background-color: #fff;
div.contract-op .q-btn-group
    width 318px
    height 36px
div.q-btn-group .q-btn
    padding 0px 25px 0px 21px
    background-color #10A0F8 !important
    color white
    font-weight bold
div.q-btn-group .q-btn-inner
    padding-left 20px
button.contract-in
    border-top-left-radius 2px !important
    border-bottom-left-radius 2px !important
    background url("../assets/in@1x.png") no-repeat 20px
button.contract-back
    background url("../assets/back@1x.png") no-repeat 20px
button.contract-add
    border-top-right-radius 2px !important
    border-bottom-right-radius 2px !important
    background url("../assets/add@1x.png") no-repeat 20px
</style>

<script>
// import uuidv4 from 'uuid/v4'
import { remote } from 'electron'
const { dialog } = remote
import fs from 'fs-extra'
import _ from 'lodash'

import { Types } from '../../src-electron/modules/ipc/types.js'

const ipc = window.ipc
const db = window.db

export default {
  data () {
    return {
    }
  },

  computed: {
    contracts () {
      return this.$store.state.contract.list
    }
  },

  methods: {
    backup () {
      dialog.showSaveDialog(
        {
          defaultPath: 'contracts.json'
        },
        filename => {
          console.log('backup filename: ', filename)
          if (!_.isUndefined(filename)) {
            try {
              console.log('write to: ', filename)
              fs.writeJsonSync(filename, db.contracts.data)
              this.$q.notify({
                message: this.$t('contract.my.notify.bak_success'),
                type: 'positive'
              })
            } catch (error) {
              console.log(error)
              this.$q.notify({
                message: this.$t('contract.my.notify.bak_fails'),
                type: 'negative'
              })
            }
          }
        }
      )
    },

    imports () {
      dialog.showOpenDialog(
        {
          title: this.$t('contract.my.open_dialog.title'),
          filters: [{ name: 'Json File', extensions: ['json', 'JSON'] }],
          properties: ['openFile']
        },
        filePaths => {
          console.log('import filePaths: ', filePaths)
          if (filePaths) {
            try {
              const items = fs.readJsonSync(filePaths[0])
              if (_.isArray(items)) {
                let data = []
                items.forEach(item => {
                  if (item._id && item.name && item.contractAddress) {
                    let doc = db.contracts.by('_id', item._id)
                    if (_.isUndefined(doc)) {
                      if (item.$loki) {
                        delete item.$loki
                      }
                      data.push(item)
                    }
                  }
                })
                this.$q.notify({
                  message: this.$t('contract.my.notify.imp_success', [data.length]),
                  type: 'positive'
                })

                if (data.length > 0) {
                  ipc.send(Types.IMPORT_CONTRACT, data)
                }
              } else {
                throw new Error(this.$t('contract.my.notify.imp_invalid_format'))
              }
            } catch (error) {
              console.log(error)
              this.$q.notify({
                message: error.message,
                type: 'negative'
              })
            }
          }
        }
      )
    }

  },

  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        {key: 'nav.contract.my.label'}
      ]
    })
  }
}
</script>
