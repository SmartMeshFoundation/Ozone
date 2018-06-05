/**
The i18n module, loads the language files and initializes i18next

@module i18n
*/
import { app } from 'electron'
import i18n from 'i18next'

import zh from './i18n/ozone.zh.i18n.json'
import en from './i18n/ozone.en.i18n.json'

const resources = {
  dev: { translation: zh },
  en: { translation: en },
  zh: { translation: zh }
}

/**
 * Given a language code, get best matched code from supported languages.
 *
 * > getBestMatchedLangCode('en-US')
 * 'en'
 * > getBestMatchedLangCode('zh-TW')
 * 'zh-TW'
 * > getBestMatchedLangCode('no-such-code')
 * 'en'
 */
i18n.getBestMatchedLangCode = langCode => {
  const codeList = Object.keys(resources)
  let bestMatchedCode = langCode
  if (codeList.indexOf(langCode) === -1) {
    if (codeList.indexOf(langCode.substr(0, 2)) > -1) {
      bestMatchedCode = langCode.substr(0, 2)
    } else {
      bestMatchedCode = 'en'
    }
  }
  return bestMatchedCode
}

let lan = app.getLocale()

global.language = lan.indexOf('zh') !== -1 ? 'zh' : 'en'

// init i18n
i18n.init({
  lng: global.language || 'zh',
  resources,
  interpolation: { prefix: '__', suffix: '__' }
})

export default i18n
