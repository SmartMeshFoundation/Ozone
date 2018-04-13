<template>
  <span>
    <ICountUp
      :startVal="startVal"
      :endVal="endVal"
      :decimals="decimals"
      :duration="duration"
      :options="options"
      ref="countUp"
    />
  </span>
</template>

<script type="text/babel">
import ICountUp from 'vue-countup-v2'
export default {
  name: 'AnimationNum',
  components: {
    ICountUp
  },
  props: {
    value: {
      required: true
    }
  },
  data () {
    return {
      startVal: 0,
      endVal: Number(this.value),
      decimals: 2,
      duration: 2.5,
      options: {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: ''
      }
    }
  },
  watch: {
    value (newVal, oldVal) {
      this.$refs.countUp.reset()
      this.endVal = Number(newVal)
    }
  }
}
</script>
