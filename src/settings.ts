import type { RecursiveRequired, Settings } from '#/global'
import { cloneDeep } from 'es-toolkit'
import settingsDefault from '@/settings.default'
import { merge } from '@/utils/object'

const globalSettings: Settings.all = {
  app: {
    enableProgress: false,
    enableDynamicTitle: true,
    enableErrorLog: true,
    enableCheckUpdates: true,
    enablePermission: true,
  },
  userPreferences: {
    enable: false,
  },
  home: {
    enable: false,
  },
  layout: {
    enableMobileAdaptation: true,
  },
  menu: {
    style: 'dot',
    enableSubMenuCollapseButton: true,
  },
  topbar: {
    mode: 'fixed',
  },
  tabbar: {
    enable: true,
    style: 'fashion',
    enableIcon: true,
    enableMemory: true,
    enableHotkeys: true,
  },
  toolbar: {
    navSearch: false,
    i18n: false,
  },
  breadcrumb: {
    style: 'modern',
    enableMainMenu: true,
  },
  mainPage: {
    enableHotkeys: false,
    iframeCacheMax: 9,
    transitionMode: 'slide-right',
  },
  copyright: {
    enable: true,
    dates: '2025-present',
    company: '苏州数游科技有限公司',
    website: 'https://www.shuyoutech.com',
  },
}

export default merge(globalSettings, cloneDeep(settingsDefault)) as RecursiveRequired<Settings.all>
