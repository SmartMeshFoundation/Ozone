<template>
    <q-page class="q-pa-lg">
        <div class="row gutter-sm">
            <token-item v-on:checked="checked"  v-for="item in tokens"
                           :key="item._id"
                           :item="item"/>
        </div>

      <div class="add-token" @click.stop="addToken()">
        Add
      </div>

    </q-page>
</template>

<style lang="stylus">
.row .item
  padding: 18px 10px;
  background-color: #fff;
.add-token {
    width: 43px;
    height: 22px;
    background: #FFFFFF;
    position: fixed;
    right 20px
    bottom 35px
    cursor pointer
    text-align center
    color #4782F6
    font-size 16px
  }
.add-token:before {
  content: "";
  position: absolute;
  top: -15px;
  left: 0;
  width: 0;
  height: 0;
  border-left: 21.5px solid transparent;
  border-right: 21.5px solid transparent;
  border-bottom: 15px solid #FFFFFF;
}
.add-token:after {
  content: "";
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 0;
  height: 0;
  border-left: 21.5px solid transparent;
  border-right: 21.5px solid transparent;
  border-top: 15px solid #FFFFFF;
}
</style>

<script>
// import uuidv4 from 'uuid/v4'

export default {
  data () {
    return {
      checkedTokens: [],
      address: this.$route.params.address.toLowerCase()
    }
  },

  computed: {
    tokens () {
      let self = this
      let items = this.$store.getters['contract/erc20Tokens'].map(item => {
        if (self.checkedTokens.length > 0 && self.checkedTokens.includes(item.contractAddress)) {
          item['checked'] = true
        } else {
          item['checked'] = false
        }
        return item
      })
      return items
    }
  },

  methods: {
    checked (flag, contractAddress) {
      if (flag) {
        this.checkedTokens.push(contractAddress)
      } else {
        this.checkedTokens = this.checkedTokens.filter(item => {
          return item !== contractAddress
        })
      }
    },
    addToken () {
      let item = {address: this.address, tokens: this.checkedTokens}
      this.$store.commit('token/updateToken', item)
      this.$router.push('/wallet/account/' + this.address)
    }
  },

  created () {
    this.checkedTokens = this.$store.getters['token/get'](this.address) === null ? [] : this.$store.getters['token/get'](this.address)['tokens']
  }
}
</script>
