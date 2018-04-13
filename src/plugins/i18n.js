import VueI18n from 'vue-i18n'
import messages from 'src/i18n'
import { remote } from 'electron'
import Quasar from 'quasar'
import moment from 'moment'

const rapp = remote.app

export default ({ app, Vue }) => {
  Vue.use(VueI18n)

  let locale = rapp.getLocale()
  locale = locale.match(/zh-*/) ? 'zh' : 'en'
  // console.log('set locale: ', locale)

  // Set i18n instance on app
  app.i18n = new VueI18n({
    locale: locale,
    fallbackLocale: 'en',
    messages
  })

  // Set i18n for quasar framework
  let lang = locale === 'zh' ? 'zh-hans' : 'en-us'
  import(`quasar-framework/i18n/${lang}`).then(lang => {
    // console.log('quasar lang: ', lang)
    Quasar.i18n.set(lang.default)
  })

  // Set i18n for moment component
  if (locale.match(/zh*/)) {
    moment.locale('zh-cn')
  } else {
    moment.locale(locale)
  }
  Vue.prototype.$moment = moment
}
