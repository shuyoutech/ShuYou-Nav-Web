import axios from 'axios'
// import qs from 'qs'
import {toast} from 'vue-sonner'

// 请求重试配置
const MAX_RETRY_COUNT = 3 // 最大重试次数
const RETRY_DELAY = 1000 // 重试延迟时间（毫秒）

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: boolean
    retryCount?: number
  }
}

const api = axios.create({
  baseURL: (import.meta.env.DEV && import.meta.env.VITE_OPEN_PROXY) ? '/proxy/' : import.meta.env.VITE_APP_API_BASEURL,
  timeout: 300000,
  responseType: 'json',
})

api.interceptors.request.use(
  (request) => {
    // 全局拦截请求发送前提交的参数
    const userStore = useUserStore()
    // 设置请求头
    if (request.headers && userStore.isLogin) {
      request.headers.satoken = userStore.token
    }
    return request
  }, (error: any) => {
    return Promise.reject(error);
  }
)

// 处理错误信息的函数
function handleError(error: any) {
  if (error.code === 401) {
    useUserStore().requestLogout()
    throw error
  }

  let message = error.msg
  if (message === 'Network Error') {
    message = '后端网络故障'
  } else if (message.includes('timeout')) {
    message = '接口请求超时'
  } else if (message.includes('Request failed with status code')) {
    message = `接口${message.substring(message.length - 3)}异常`
  } else if (error.code === 500 && message.includes('token 无效')) {
    useUserStore().requestLogout()
  }
  toast.error('Error', {
    description: message,
  })
  return Promise.reject(error)
}

api.interceptors.response.use(
  (response) => {
    /**
     * 全局拦截请求发送后返回的数据，如果数据有报错则在这做全局的错误提示
     * 假设返回数据格式为：{ status: 1, error: '', data: {} }
     * 规则是当 status 为 1 时表示请求成功，为 0 时表示接口需要登录或者登录状态失效，需要重新登录
     * 请求出错时 error 会返回错误信息
     */
    if (response.status !== 200) {
      if (response.data.msg !== '') {
        handleError(response.data).then(() => {
        })
        return Promise.reject(response.data)
      }
    }
    if (response.status === 200 && response.data.code === 401) {
      handleError(response.data).then(() => {
      })
      return Promise.reject(response.data)
    }
    if (response.headers['content-disposition']) {
      return Promise.resolve(response)
    }
    return Promise.resolve(response.data)
  },
  async (error) => {
    // 获取请求配置
    const config = error.config

    // 如果配置不存在或未启用重试，则直接处理错误
    if (!config || !config.retry) {
      return handleError(error)
    }

    // 设置重试次数
    config.retryCount = config.retryCount || 0

    // 判断是否超过重试次数
    if (config.retryCount >= MAX_RETRY_COUNT) {
      return handleError(error)
    }

    // 重试次数自增
    config.retryCount += 1

    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))

    // 重新发起请求
    return api(config)
  },
)

export default api
