<template>
  <q-page class="q-pa-lg">

    <div class="row gutter-sm">
      <div class="col-6">
        <div class="item">
          <div class="q-title">title1</div>
          <div class="q-subheading">subtitle1</div>
        </div>
      </div>
      <div class="col-6">
        <div class="item">
          <div class="q-title">title2</div>
          <div class="q-subheading">subtitle2</div>
        </div>
      </div>
      <div class="col-6">
        <div class="item">
          <div class="q-title">title3</div>
          <div class="q-subheading">subtitle3</div>
        </div>
      </div>
      <div class="col-6">
        <div class="item">
          <div class="q-title">title4</div>
          <div class="q-subheading">subtitle4</div>
        </div>
      </div>
      <div class="col-6">
        <div class="item">
          <div class="q-title">title5</div>
          <div class="q-subheading">subtitle5</div>
        </div>
      </div>
    </div>

  </q-page>
</template>

<style lang="stylus">
.row .item
  padding 10px
  background-color #fff
  cursor pointer
</style>

<script>

export default {
  data () {
    return {
    }
  },
  computed: {

  },
  created () {
    // pass data to parent component
    this.$emit('updateToolbar', '我的合约')
  }
}
</script>
