import { FetchUtilProps, FetchPropsUrlMap, FetchProps } from './interface'
import FetchUtil from './FetchUtil'

import Restful from './Restful'

export * as resUtil from './error'

export * from './interface'
interface ApiFactory {
  fetchUtil: FetchUtil
  getRestfulApi: (entry: string) => Restful
}

export const initApiFactory = (props: FetchUtilProps): ApiFactory => {
  return {
    fetchUtil: new FetchUtil(props),
    getRestfulApi(entry: string) {
      if (!this[entry]) {
        this[entry] = new Restful(entry, this.fetchUtil)
      }
      return this[entry]
    }
  }
}

// 拦截替换api
export const checkInterceptConfig = (
  config: FetchProps,
  interceptApis: FetchPropsUrlMap
): FetchProps => {
  const {
    url: configUrl,
    headers: configHeaders,
    method: configMethod
  } = config || {}

  const uri = new URL(configUrl)
  const { pathname, search } = uri

  // 拦截配置
  const interceptPathList = Object.keys(interceptApis || {})

  // 如果pathname在拦截API配置中存在，那么需要修改替换成拦截配置中的参数。
  if (interceptPathList.includes(pathname)) {
    const {
      headers = configHeaders,
      url = configUrl,
      method = configMethod
    } = interceptApis[pathname] || {}

    return {
      ...config,
      url: `${url || ''}${search || ''}`,
      method,
      headers: {
        ...(configHeaders || {}),
        ...(headers || {})
      }
    }
  }
  return config
}

export default initApiFactory
