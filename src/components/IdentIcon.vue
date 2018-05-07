<template>
  <img :src="identicon()"
       class="q-item-avatar" />
</template>

<script>

export default {
  name: 'IdentIcon',
  props: {
    value: {
      type: String,
      required: true
    },
    size: {
      default: 8
    }
  },
  methods: {
    identicon () {
      let seed = this.value.toLowerCase()
      let size = this.size
      return this.$icon(seed, size)
    }
  }
}
</script>
