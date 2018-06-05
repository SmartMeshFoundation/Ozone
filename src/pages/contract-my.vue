<template>
    <q-page class="q-pa-lg">

        <div class="row q-mb-lg">
          <q-btn-group >
            <q-btn icon="playlist_add"
                    :label="$t('contract.my.btn.import')"
                    color="secondary"
                    @click="imports" />
            <q-btn icon="save"
                    :label="$t('contract.my.btn.backup')"
                    color="secondary"
                    @click="backup" />
            <q-btn icon="add"
                    :label="$t('contract.my.btn.add')"
                    color="secondary"
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
.row .item {
  padding: 10px;
  background-color: #fff;
}
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
