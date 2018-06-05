<template>
    <div class="col-6">
        <div class="row item items-start shadow-1">
            <router-link tag="div" class="col-11 item-main" :to="'/contract/my/view?id='+item._id">
              <div class="q-title">{{item.name}}</div>
              <div class="q-subheading address q-mt-md" @click.stop>{{contractAddress}}</div>
            </router-link>

            <div class="col-1 text-center">
                <q-btn icon="delete"
                       color="secondary"
                       @click="deleteItem(item._id)"
                       flat
                       round
                       dense />
            </div>
        </div>
    </div>
</template>

<style lang="stylus">
.item .item-main
  cursor pointer

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
        return this.item.contractAddress
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
