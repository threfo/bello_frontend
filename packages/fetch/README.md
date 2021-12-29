# `fetch`

> api 请求工具

## Usage

```js
import { initApiFactory, checkInterceptConfig } from '@belloai/fetch'
import { getFormUtcToLocalMoment } from '@belloai/moment'
import axios from 'axios'
import { get } from 'lodash'

import { ApisConfigMap } from '@/interface/config'

import Store from '@/store'
import { msgPost } from '@/utils/delayMsg'
import LS from '@/utils/local-storage'
import { setPathForwarded } from '@/utils/request/getApiSource'

import { openBindWechatDailog } from '@/components/BelloBindWechat/utils'

export const isExpire = (apiExpireAtProp = '') => {
  const userInfo = LS.get('userInfo')
  const { expire_at } = userInfo || {}
  const expireAt = apiExpireAtProp || expire_at

  if (expireAt) {
    const isExpire = getFormUtcToLocalMoment(expireAt).diff(new Date())
    if (isExpire <= 0) {
      LS.clearAllExcept()
      return true
    }
  }
  return false
}

export const instance = axios.create()

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // 看是否有需要替换的 api
    const interceptApis = get(Store.getters.serverConfig, 'intercept_apis', {})
    return checkInterceptConfig(config, interceptApis)
  },
  function (error) {
    console.error('request error: ', error)
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    setPathForwarded(response)
    return response
  },
  function (error) {
    setPathForwarded(error.response)
    console.error('response error: ', error)
    return Promise.reject(error)
  }
)

export const isNoUseAuthorization = (url, token) => {
  const [orgUrl] = url.split('?')
  return (
    !token ||
    [
      'config/private_deploy',
      'user/login',
      'user/signup',
      'user/signup_sms',
      'limit_code/is_expire'
    ].includes(orgUrl)
  )
}

export const getAuthorization = props => {
  const token = LS.get('token')
  const { url } = props || {}
  if (isNoUseAuthorization(url, token)) {
    return {
      Authorization: token
    }
  }
  return {}
}

export const hostnameMap = {
  localhost: '',
  '127.0.0.1': '',
  'stg.belloai.com': 'https://stg.belloai.com',
  'osr-f.bellodash.com': 'https://test.belloai.com',
  'www.belloai.com': 'https://www.belloai.com',
  'stg-oem.belloai.com': 'https://stg-oem.belloai.com',
  'oem.belloai.com': 'https://oem.belloai.com',
  'belloai.com': 'https://www.belloai.com'
}

export const getSynchronizeApisMap = (): ApisConfigMap => {
  const { synchronize_apis } = Store.getters.serverConfig || {}
  return synchronize_apis || {}
}

export const getMethodAndUrl = (props: FetchProps) => {
  const { url, method = 'get' } = props || {}
  return `${method} ${url}`.toLowerCase()
}

export const getNeedSynchronizeApis = (props: FetchProps) => {
  return getSynchronizeApisMap()[getMethodAndUrl(props)] || []
}

export const getSynchronizeApis = async props => {
  return getNeedSynchronizeApis(props)
}

export const apiFactory: any = initApiFactory({
  // debug: true, // 是否需要打印内部的关键方法信息
  // errorKeyPolicy: {}, // 异常策略的key值推断策略，可以重写任意一个key值推断策略
  // errorPolicy: {}, // 异常策略，可以重写任意一个key策略
  // apiPre: '', // 拼接api 请求链接时的api前缀，默认值 '/api/'，例如: http://t.com/api/a, `${host}${apiPre}${path}`
  // lsApiKey: '', // 拼接api 请求链接时的优先读取local storage中的这个key作为host，默认值 'apiServer'
  // getDefHeaders, // 获取默认的headers 的方法
  // getBaseUrl, // 替换内置的 getBaseUrl 的方法
  // needThrowResError, // 替换内置的 needThrowResError 的方法
  getSynchronizeApis, // 获取需要同步请求的配置对象
  instance, // 核心的请求工具 这里是 axios 的实例
  LS, // 获取一些 local storage 内的参数的工具实例
  errorPolicyProps: {
    experienceAccountExpiredFunc: () =>
      openBindWechatDailog('账号到期提醒', {
        componentName: 'service-qrCode',
        tips: '您的账号已到期，扫码联系客服获取免费使用时长'
      })
  }, // 异常时提供给异常策略的参数

  hostnameMap, // 域名和api的映射
  msgPost, // 异常时提示的方法
  getAuthorization, // 请求时获取token加到headers的方法
  getCancelSource: () => {
    return axios.CancelToken.source()
  }, // 取消请求的key获取方法，根据 instance 而定
  isExpire // 判断用户过期的方法
})
```
