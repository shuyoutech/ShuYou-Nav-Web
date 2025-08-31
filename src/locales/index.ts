import {createI18n} from 'vue-i18n'

import enUS from './lang/en-US.json'
import zhCN from './lang/zh-CN.json'

type MessageSchema = typeof enUS

const i18n = createI18n<[MessageSchema], 'en-US' | 'zh-CN'>({
  legacy: false,
  locale: localStorage.getItem("language") || "zh-CN",
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  }
})

export default i18n;
