import { FetchUtilProps, FetchPropsUrlMap, FetchProps } from './interface'
import FetchUtil from './FetchUtil'

import Restful from './Restful'
import { parse, stringify } from 'qs'

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
    method: configMethod = 'get'
  } = config || {}

  const [orgUrl, queryStr] = configUrl.split('?')

  const uri = new URL(orgUrl)
  const { pathname, host } = uri

  // 拦截配置
  const key1 = `${configMethod.toLowerCase() || ''} ${pathname}`
  const key2 = `${configMethod.toUpperCase() || ''} ${pathname}`

  const interceptApiConfig =
    interceptApis[key1] || interceptApis[key2] || interceptApis[pathname]

  if (interceptApiConfig) {
    const {
      headers = configHeaders,
      url = configUrl,
      method = configMethod
    } = interceptApiConfig

    const [interceptUrl, interceptQueryStr] = url.split('?')

    // 如果pathname在拦截API配置中存在，那么需要修改替换成拦截配置中的参数。

    let afterUrl = interceptUrl
    if (interceptQueryStr || queryStr) {
      try {
        const query = {
          ...parse(queryStr),
          ...parse(interceptQueryStr)
        }
        afterUrl = `${afterUrl}?${stringify(query)}`
      } catch (error) {
        console.error('checkInterceptConfig error:', error)
      }
    }

    const afterConfig = {
      ...config,
      url: afterUrl,
      method,
      headers: {
        ...(configHeaders || {}),
        ...(headers || {})
      }
    }

    const { headers: afterHeaders } = afterConfig
    const { host: afterHost } = new URL(afterUrl)

    const { _apiHeaders } = (window || {}) as any
    if (host !== afterHost && _apiHeaders) {
      Object.keys(_apiHeaders).forEach(key => {
        delete afterHeaders[key]
      })
      afterConfig.headers = afterHeaders
    }

    return afterConfig
  }

  return config
}

export default initApiFactory
