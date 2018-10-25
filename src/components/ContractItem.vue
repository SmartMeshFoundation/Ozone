<template>
    <div class="col-4">
        <div class="row item items-start contract-item">
            <router-link tag="div" class="col-11 item-main" :to="'/contract/my/view?id='+item._id">
              <div class="q-title">{{item.name}}</div>
              <div class="q-subheading address q-mt-md" @click.stop>{{contractAddress}}</div>
            </router-link>

            <div class="col-1 text-center">
                <q-btn class="delete-btn"
                       @click="deleteItem(item._id)"
                       round
                       dense />
            </div>
        </div>
      <q-modal class="verify-modal" v-model="showConfirmModal">
        <div class="q-pa-md">
          <p class="q-headline">{{ $t('contract.my.delete_dialog.title') }}</p>
          <p class="text-1">{{ $t('contract.my.delete_dialog.message', [item.name]) }}</p>
          <q-btn :label="$t('button.ok')"
                 color="primary"
                 class="float-right q-my-md"
                 @click="confirmDel" />
          <q-btn style="right: 107px" :label="$t('button.cancel')"
                 color="primary"
                 class="float-right q-my-md"
                 @click="showConfirmModal = false" />
        </div>
      </q-modal>
    </div>
</template>

<style lang="stylus">
.contract-item
  // width 316px
  height 88px
  border-radius 4px !important
.item-main
  cursor pointer
.contract-item .q-title
  font-size 16px
.contract-item .q-subheading
  font-size 12px
.delete-btn
  background url("../assets/del@1x.png") no-repeat center
  right 3px !important
.delete-btn:hover
  background-color #E7F5FE !important
.q-focus-helper
  none !important
</style>

<script>

export default {
  data () {
    return {
      showConfirmModal: false
    }
  },
  props: {
    item: {
      required: true
    }
  },
  computed: {
    contractAddress () {
      if (this.item.contractAddress) {
        return this.item.contractAddress.substr(0, 18) + '...' + this.item.contractAddress.substr(this.item.contractAddress.length - 18, this.item.contractAddress - 1)
      } else {
        return 'Pending ...'
      }
    }
  },
  methods: {
    deleteItem (id) {
      /* this.$q.dialog({
        title: this.$t('contract.my.delete_dialog.title'),
        message: this.$t('contract.my.delete_dialog.message', [this.item.name]),
        ok: true,
        cancel: true
      })
        .then(() => {
          this.$store.commit('contract/remove', id)
        })
        .catch(() => {
          // Picked "Cancel" or dismissed
        }) */
      this.showConfirmModal = true
    },
    confirmDel () {
      this.$store.commit('contract/remove', this.item._id)
    }
  }
}
</script>
