import { parse, stringify } from 'qs'

import { FetchPropsUrlMap, FetchProps } from './interface'

export const formatAfterConfig = ({
  config,
  afterUrl,
  method,
  configHeaders,
  headers,
  host,
  otherConfig
}) => {
  let afterConfig = {
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

  if (otherConfig) {
    afterConfig = {
      ...afterConfig,
      ...otherConfig
    }
  }

  return afterConfig
}

export const getInterceptApiConfigChange = ({
  configHeaders,
  configUrl,
  configMethod,
  interceptApiConfig,
  queryStr
}) => {
  const {
    headers = configHeaders,
    url = configUrl,
    method = configMethod,
    otherConfig
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

  return {
    headers,
    afterUrl,
    method,
    otherConfig
  }
}

export const getInterceptApiConfig = (
  { interceptApis, pathname, configMethod },
  windowLocation?: any
) => {
  // 拦截配置
  const key1 = `${configMethod.toLowerCase() || ''} ${pathname}`
  const key2 = `${configMethod.toUpperCase() || ''} ${pathname}`

  const {
    host,
    hostname,
    href,
    origin,
    pathname: locationPathname
  } = windowLocation || window.location

  const finalInterceptApis =
    interceptApis[host] ||
    interceptApis[hostname] ||
    interceptApis[href] ||
    interceptApis[origin] ||
    interceptApis[locationPathname] ||
    interceptApis

  const interceptApiConfig =
    finalInterceptApis[key1] ||
    finalInterceptApis[key2] ||
    finalInterceptApis[pathname]

  return interceptApiConfig
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

  const interceptApiConfig = getInterceptApiConfig({
    interceptApis,
    pathname,
    configMethod
  })

  if (interceptApiConfig) {
    const { headers, afterUrl, method, otherConfig } =
      getInterceptApiConfigChange({
        configHeaders,
        configUrl,
        configMethod,
        interceptApiConfig,
        queryStr
      })
    return formatAfterConfig({
      config,
      afterUrl,
      method,
      configHeaders,
      headers,
      host,
      otherConfig
    })
  }

  return config
}
