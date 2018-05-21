<template>
    <div class="col-6">
        <div class="row item items-start shadow-1">
            <div class="col-11">
                <div class="q-title">{{item.name}}</div>
                <div class="q-subheading address q-mt-md">{{contractAddress}}</div>
            </div>
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
        title: '警告',
        message: '删除合约：' + this.item.name,
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
