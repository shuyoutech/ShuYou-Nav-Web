/**
 * 路由配置
 * @description 所有路由都在这里集中管理
 */
const routes: any[] = [
  // 登录页
  {
    path: "/",
    redirect: "/home/index",
  },
  // 404
  {
    path: "/404",
    name: "404",
    component: () => import('@/views/[...all].vue'),
    meta: {
      title: "404页",
      show: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/layouts/layout.vue'),
    redirect: '/home/index',
    meta: {
      title: '首页',
      show: true,
      icon: 'ri:home-line',
    },
    children: [
      {
        path: 'index',
        name: 'HomeIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '导航首页',
          show: false,
        },
      },
    ],
  },
  {
    path: '/comprehensive',
    name: 'NavComprehensive',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '综合网站',
      show: true,
      icon: 'i-mdi:web',
    },
    children: [
      {
        path: '',
        name: 'NavComprehensiveIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '综合网站',
          show: false,
        },
      },
    ],
  },
  {
    path: '/leisure',
    name: 'NavLeisure',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '休闲娱乐',
      show: true,
      icon: 'i-mdi:gamepad-variant',
    },
    children: [
      {
        path: '',
        name: 'NavLeisureIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '休闲娱乐',
          show: false,
        },
      },
    ],
  },
  {
    path: '/lifestyle',
    name: 'NavLifestyle',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '生活服务',
      show: true,
      icon: 'i-mdi:home-heart',
    },
    children: [
      {
        path: '',
        name: 'NavLifestyleIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '生活服务',
          show: false,
        },
      },
    ],
  },
  {
    path: '/education',
    name: 'NavEducation',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '教育文化',
      show: true,
      icon: 'i-mdi:school',
    },
    children: [
      {
        path: '',
        name: 'NavEducationIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '教育文化',
          show: false,
        },
      },
    ],
  },
  {
    path: '/industry',
    name: 'NavIndustry',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '行业分类',
      show: true,
      icon: 'i-mdi:briefcase',
    },
    children: [
      {
        path: '',
        name: 'NavIndustryIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '行业分类',
          show: false,
        },
      },
    ],
  },
  {
    path: '/custom',
    name: 'NavCustom',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '我的导航',
      show: true,
      icon: 'i-mdi:bookmark-multiple',
    },
    children: [
      {
        path: '',
        name: 'NavCustomIndex',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '我的导航',
          show: false,
        },
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('@/layouts/layout.vue'),
    meta: {
      title: '个人中心',
      show: false,
      icon: 'ri:user-settings-line',
    },
    children: [
      {
        path: 'usage',
        name: 'usageIndex',
        component: () => import('@/views/settings/usage.vue'),
        meta: {
          title: '用量信息',
          show: false,
        },
      },
      {
        path: 'bills',
        name: 'billsIndex',
        component: () => import('@/views/settings/bills.vue'),
        meta: {
          title: '账单信息',
          show: false,
        },
      },
      {
        path: 'invoice',
        name: 'invoiceIndex',
        component: () => import('@/views/settings/invoice.vue'),
        meta: {
          title: '发票管理',
          show: false,
        },
      },
      {
        path: 'about',
        name: 'aboutIndex',
        component: () => import('@/views/settings/about.vue'),
        meta: {
          title: '关于我们',
          show: false,
        },
      },
    ],
  },
]

export default routes
