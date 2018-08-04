<template>
  <div class="lock-screen">
    <div class="login-logo">
      <img alt="Ozone logo"
           src="../assets/login-logo@1x.png"
           class="ozone-logo" width="114" height="114"/>
      <div class="logo-label">Ozone</div>
    </div>
    <div class="login-form">
      <div>Password:</div><div><input v-model="password" type="password" /></div><div @click.stop="login"></div>
    </div>
  </div>
</template>
<style lang="stylus">
  .lock-screen
    background background url("../assets/lock@2x.png") no-repeat center center
    background-size cover
    width 100%
    height 100%
    position absolute
    background-attachment fixed
  .login-logo
    background none
    text-align center
    margin-top 91px
  .login-logo .logo-label
    color #ffffff
    font-size 28px
    line-height 40px
    margin-top 8px
  .login-form
    display table
    margin 0 auto
    margin-top 75px
  .login-form div
    color white
    font-size 14px
    line-height 20px
    display table-cell
    background none
  .login-form div:nth-child(1)
    width 79px
  .login-form div:nth-child(2) input
    width 220px
    border none
    background none
    border-bottom 1px solid #ffffff
    vertical-align text-bottom
    color: #FFFFFF
    margin-right 10.5px
  .login-form div:nth-child(2) input:focus
    border none
    border-bottom 1px solid #ffffff
    background none
    outline:none
  .login-form div:nth-child(3)
    background url("../assets/login-confirm@1x.png") no-repeat center
    width 20px
    height 20px
    cursor pointer
</style>

<script>

export default {
  data () {
    return {
      password: '',
      lock: this.$store.getters['lock/get']
    }
  },
  methods: {
    login () {
      if (this.password === this.lock.password) {
        this.$router.push('/dashboard')
      } else {
        this.$q.notify(this.$t('lock.lock_wrong_pwd'))
      }
    }
  },
  created () {
  },
  destroyed () {

  }
}
</script>
