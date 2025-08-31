// 该文件为系统默认配置，请勿修改！！！

import type { RecursiveRequired, Settings } from '#/global'

const globalSettingsDefault: RecursiveRequired<Settings.all> = {
  app: {
    themeSync: true,
    lightTheme: 'default',
    darkTheme: 'default',
    colorScheme: 'light',
    radius: 0.5,
    enableMournMode: false,
    enableColorAmblyopiaMode: false,
    defaultLang: '',
    enablePermission: false,
    enableProgress: true,
    enableDynamicTitle: false,
    enableWatermark: false,
    enableErrorLog: false,
    loginExpiredMode: 'redirect',
    enableCheckUpdates: false,
    routeBaseOn: 'frontend',
    direction: 'ltr',
  },
  userPreferences: {
    enable: false,
    storageTo: 'local',
  },
  home: {
    enable: true,
    title: 'app.route.home',
    fullPath: '/',
  },
  layout: {
    widthMode: 'adaption',
    widthModeScope: 'outer',
    enableMobileAdaptation: false,
  },
  menu: {
    baseOn: 'frontend',
    mode: 'side',
    style: '',
    enableDark: false,
    mainMenuClickMode: 'switch',
    subMenuUniqueOpened: true,
    subMenuCollapse: false,
    subMenuAutoCollapse: false,
    enableSubMenuCollapseButton: false,
    enableHotkeys: false,
  },
  topbar: {
    mode: 'static',
    switchTabbarAndToolbar: false,
  },
  tabbar: {
    enable: false,
    style: '',
    enableIcon: false,
    dblclickAction: 'close',
    enableMemory: false,
    enableHotkeys: false,
    storageTo: 'local',
  },
  toolbar: {
    enable: true,
    favorites: false,
    breadcrumb: true,
    navSearch: true,
    notification: false,
    i18n: false,
    fullscreen: false,
    pageReload: false,
    colorScheme: false,
    layout: ['favorites', 'breadcrumb', '->', 'navSearch', 'notification', 'i18n', 'fullscreen', 'pageReload', 'colorScheme'],
  },
  favorites: {
    storageTo: 'local',
  },
  breadcrumb: {
    style: '',
    enableMainMenu: false,
  },
  mainPage: {
    enableHotkeys: true,
    iframeCacheMax: 3,
    enableTransition: true,
    transitionMode: 'fade',
  },
  navSearch: {
    enableHotkeys: true,
  },
  copyright: {
    enable: false,
    dates: '',
    company: '苏州数游科技有限公司',
    website: '',
    beian: '苏ICP备2025197988号',
  },
}

export default globalSettingsDefault
