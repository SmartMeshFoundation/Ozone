<template>
    <q-select :options="options"
              v-model="lang" />
</template>

<script>

export default {
  data () {
    return {
      lang: this.$q.i18n.lang,
      options: [
        { label: '中文 (简体)', value: 'zh-hans' },
        { label: 'English (US)', value: 'en-us' }
      ]
    }
  },
  watch: {
    lang (lang) {
      // 切换vue-i18n的语言
      if (lang === 'zh-hans') {
        this.$i18n.locale = 'zh'
        // moment 组件国际化
        this.$moment.locale('zh-cn')
      } else {
        this.$i18n.locale = 'en'
        this.$moment.locale('en')
      }

      // 切换quasar-framework的语言
      import(`quasar-framework/i18n/${lang}`).then(lang => {
        this.$q.i18n.set(lang.default)
      })
    }
  }
}
</script>
