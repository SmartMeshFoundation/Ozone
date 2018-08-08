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
      this.$q.dialog({
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
        })
    }
  }
}
</script>
