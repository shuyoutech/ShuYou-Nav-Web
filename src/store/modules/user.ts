import router from '@/router'
import {authAccessToken, authLogout, authSmsLogin} from "@/api/auth";
import {memberGetProfile} from "@/api/member";

export const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const account = ref(localStorage.getItem('account') ?? '')
    const token = ref(localStorage.getItem('token') ?? '')
    const avatar = ref(localStorage.getItem('avatar') ?? '')
    const nickname = ref(localStorage.getItem('nickname') ?? '')
    const userInfo = ref(localStorage.getItem('userInfo') ? JSON.parse(<string>localStorage.getItem('userInfo')) : {})
    const permissions = ref<string[]>([])
    const isLogin = computed(() => {
      return !!token.value;
    })

    // 第三方扫码登录
    async function accessToken(data: {
      code: string
    }) {
      const res = await authAccessToken({
        socialType: '01',
        code: data.code,
      });
      localStorage.setItem('token', res.data.accessToken)
      localStorage.setItem('userId', res.data.userId)
      token.value = res.data.accessToken
      await getUserInfo()
    }

    // 手机短息登录
    async function smsLogin(data: {
      mobile: string
      code: string
    }) {
      const res = await authSmsLogin({mobile: data.mobile, code: data.code});
      localStorage.setItem('account', data.mobile)
      localStorage.setItem('token', res.data.accessToken)
      localStorage.setItem('userId', res.data.userId)
      account.value = data.mobile
      token.value = res.data.accessToken
      await getUserInfo()
    }

    // 手动登出
    async function logout() {
      await authLogout()
      // 此处仅清除计算属性 isLogin 中判断登录状态过期的变量，以保证在弹出登录窗口模式下页面展示依旧正常
      localStorage.removeItem('token')
      token.value = ''
      router.push({
        name: 'home',
      }).then(logoutCleanStatus)
    }

    // 请求登出
    function requestLogout() {
      // 此处仅清除计算属性 isLogin 中判断登录状态过期的变量，以保证在弹出登录窗口模式下页面展示依旧正常
      localStorage.removeItem('token')
      token.value = ''
      router.push({
        name: 'home',
      }).then(logoutCleanStatus)
    }

    // 登出后清除状态
    function logoutCleanStatus() {
      localStorage.removeItem('account')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('nickname')
      localStorage.removeItem('avatar')
      account.value = ''
      avatar.value = ''
      permissions.value = []
    }

    // 获取用户信息
    async function getUserInfo() {
      const res = await memberGetProfile()
      avatar.value = res.data.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + res.data.nickname
      nickname.value = res.data.nickname
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      localStorage.setItem('avatar', avatar.value)
      localStorage.setItem('nickname', nickname.value)
    }

    return {
      account,
      token,
      avatar,
      nickname,
      permissions,
      userInfo,
      isLogin,
      smsLogin,
      logout,
      requestLogout,
      getUserInfo,
      accessToken,
    }
  },
)
