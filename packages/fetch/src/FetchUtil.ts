import { isFunction, isString } from 'lodash'

import {
  CancelSource,
  ErrorPolicyMap,
  ErrorKeyPolicyMap,
  CancelMap,
  FetchUtilProps,
  FetchProps,
  Method,
  Response,
  ResponseType
} from './interface'

import { needData, getUrl, getSynchronizeApisProps } from './utils'

import {
  getErrorKey,
  getErrorKeyPolicy,
  getErrorPolicy,
  needThrowResError as defNeedThrowResError
} from './error'

class FetchUtil {
  instance: any = null // 请求的实例，如 axios.create()

  private msgPost?: (msg: string) => void
  private getAuthorization?: (props?: FetchProps) => string | any
  private getCancelSource?: () => CancelSource
  private isExpire?: () => boolean
  private getSynchronizeApis?: (
    props: FetchProps,
    res: any
  ) => Promise<FetchProps[]>

  private LS?: any
  private hostnameMap: any = {}

  private needThrowResError = defNeedThrowResError
  private errorPolicy: ErrorPolicyMap = getErrorPolicy()
  private errorKeyPolicy: ErrorKeyPolicyMap = getErrorKeyPolicy()
  private errorPolicyProps: any
  private cancelMap: CancelMap = {}
  private apiPre = '/api/'
  private debug = false
  private lsApiKey = 'apiServer'
  private windowApiHeadersKey = '_apiHeaders'

  constructor(props: FetchUtilProps) {
    const {
      debug = false,
      errorKeyPolicy,
      errorPolicyProps,
      errorPolicy,
      instance,
      hostnameMap,
      msgPost,
      needThrowResError,
      getAuthorization,
      getCancelSource,
      getDefHeaders,
      getBaseUrl,
      getSynchronizeApis,
      apiPre,
      LS,
      lsApiKey = 'apiServer',
      windowApiHeadersKey = '_apiHeaders'
    } = props || {}
    this.debug = debug
    this.instance = instance
    this.errorPolicyProps = errorPolicyProps
    this.msgPost = msgPost
    this.getAuthorization = getAuthorization
    this.getCancelSource = getCancelSource

    this.LS = LS

    this.lsApiKey = lsApiKey
    this.windowApiHeadersKey = windowApiHeadersKey

    if (errorKeyPolicy) {
      this.initErrorKeyPolicy(errorKeyPolicy)
    }
    if (errorPolicy) {
      this.initErrorPolicy(errorPolicy)
    }
    if (needThrowResError) {
      this.needThrowResError = needThrowResError
    }
    if (getDefHeaders) {
      this.getDefHeaders = getDefHeaders
    }
    if (getBaseUrl) {
      this.getBaseUrl = getBaseUrl
    }
    if (getSynchronizeApis) {
      this.getSynchronizeApis = getSynchronizeApis
    }

    if (hostnameMap) {
      this.hostnameMap = hostnameMap
    }
    if (apiPre !== undefined) {
      this.apiPre = apiPre
    }
  }

  private log(...a) {
    if (this.debug) {
      console.log(...a, this)
    }
  }

  private getAuthorizationHeaders(props?: FetchProps) {
    let authorizationHeaders: any = {}
    if (this.getAuthorization) {
      const authorization = this.getAuthorization(props)
      if (authorization) {
        authorizationHeaders = authorization
        if (isString(authorization)) {
          authorizationHeaders = {
            Authorization: authorization
          }
        }
      }
    }
    return authorizationHeaders
  }

  private getDefHeaders(props?: FetchProps) {
    this.log('getDefHeaders', props)

    return {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...this.getWindowApiHeaders()
    }
  }

  getWindowApiHeaders(): any {
    return (window || {})[this.windowApiHeadersKey] || {}
  }

  getCleanWindowApiHeadersObj(): any {
    return Object.keys(this.getWindowApiHeaders()).reduce((obj, key) => {
      obj[key] = undefined
      return obj
    }, {})
  }

  private getHeaders(props?: FetchProps) {
    const { headers } = props || {}

    const willNeedHeaders = {
      ...(this.getDefHeaders(props) || {}),
      ...(this.getAuthorizationHeaders(props) || {}),
      ...(headers || {})
    }

    // 可以通过 设置 空值的方式来清除一些内置的headers
    return Object.keys(willNeedHeaders).reduce((obj, key) => {
      const val = willNeedHeaders[key]
      if (val) {
        obj[key] = val
      }
      return obj
    }, {})
  }

  private getRequestConfig(props: FetchProps) {
    const {
      url,
      method = 'GET',
      data,
      responseType = 'json',
      cancelKey
    } = props

    const requestConfig: any = {
      method,
      url: getUrl({
        url,
        method,
        data,
        baseUrl: this.getBaseUrl(props)
      }),
      headers: this.getHeaders(props),
      timeout: 300000,
      responseType
    }

    if (needData(method)) {
      requestConfig.data = data
    }

    const cancelToken = this.checkCancel(cancelKey)
    if (cancelToken) {
      requestConfig.cancelToken = cancelToken
    }

    return requestConfig
  }

  getOtherBaseUrl(): string {
    let host
    if (this.lsApiKey) {
      host = this.LS.get(this.lsApiKey)
    }
    return host || ''
  }

  getHostNameMapUrl(): string {
    return this.hostnameMap[location.hostname] || location.origin
  }

  getBaseUrl(props?: FetchProps): string {
    this.log('getBaseUrl', props)
    let host = this.getOtherBaseUrl()

    if (!host) {
      host = this.getHostNameMapUrl()
    }
    return `${host || location.origin}${this.apiPre}`
  }

  private checkCancel(cancelKey?: string) {
    let cancelToken

    // 记录需要取消的接口
    if (cancelKey) {
      const cancelTokenSource = this.cancelMap[cancelKey]

      // 触发取消操作
      if (cancelTokenSource) {
        console.warn('取消请求', cancelKey)
        cancelTokenSource.cancel('cancelReq')
      }
      if (this.getCancelSource) {
        const source = this.getCancelSource()
        cancelToken = source.token
        this.cancelMap[cancelKey] = source
      } else {
        console.warn(
          '实例化时没有定义 getCancelSource 方法，无法使用 cancel 请求'
        )
      }
    }
    return cancelToken
  }

  private delCancelToken(cancelKey: string): void {
    if (cancelKey) {
      delete this.cancelMap[cancelKey]
    }
  }

  private initErrorKeyPolicy(errorKeyPolicy: ErrorKeyPolicyMap): void {
    const defErrorKeyPolicy = getErrorKeyPolicy()
    Object.keys(defErrorKeyPolicy).forEach(key => {
      const func = errorKeyPolicy[key]
      if (isFunction(func)) {
        this.errorKeyPolicy[key] = func
      }
    })
  }

  private initErrorPolicy(errorPolicy: ErrorPolicyMap): void {
    Object.keys(errorPolicy).forEach(key => {
      const func = errorPolicy[key]
      if (isFunction(func)) {
        this.errorPolicy[key] = func
      }
    })
  }

  private getErrorKey(error): string | undefined {
    return getErrorKey(error, this.errorKeyPolicy)
  }

  private async fetchSynchronizeApis(props: FetchProps, res: any) {
    this.log('fetchSynchronizeApis', props)
    if (this.getSynchronizeApis) {
      const needSynchronizeApis = await this.getSynchronizeApis(props, res)
      const apiProps = getSynchronizeApisProps({
        needSynchronizeApis,
        res,
        props
      })
      const { length } = apiProps || []

      if (length) {
        try {
          await Promise.all(apiProps.map(item => this.coreFetch(item)))
        } catch (error) {
          console.error('fetchSynchronizeApis', error)
        }
      }
    }
  }

  coreFetch(props: FetchProps) {
    return new Promise((resolve, reject) => {
      const {
        url = '',
        data = {},
        method = 'GET',
        headers = {},
        cancelKey = '',
        responseType = 'json'
      } = props || {}
      this.log('coreFetch', props)
      const requestConfig = this.getRequestConfig({
        url,
        method,
        data,
        responseType,
        cancelKey,
        headers
      })

      // 处理账号过期
      if (this.isExpire && this.isExpire()) reject(new Error('expireAt'))

      this.instance(requestConfig)
        .then(response => {
          this.delCancelToken(cancelKey)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  async fetchByObj(props: FetchProps) {
    const {
      url = '',
      data,
      method,
      headers,
      cancelKey,
      responseType,
      isReturnResponse
    } = props || {}

    let hackProps = {}
    let postData = {}

    if (Array.isArray(data)) {
      postData = data
    } else if (data instanceof FormData) {
      postData = data
    } else {
      const { hackProps: dataHackProps, ...postDataObj } = data || {}
      hackProps = dataHackProps
      postData = postDataObj
    }

    try {
      const res = (await this.coreFetch({
        url,
        data: postData,
        method,
        headers,
        cancelKey,
        responseType
      })) as Response

      // 兼容{code, data, message}结构，如果code不等于0，抛出error错误

      if (this.needThrowResError(res.data)) {
        throw res.data
      }

      this.fetchSynchronizeApis(props, res)

      if (isReturnResponse) {
        return res
      }
      return res.data
    } catch (error: any) {
      this.log('fetchByObj error', error)

      const msgPost = msg => {
        const { notMsgPost } = (hackProps || {}) as any
        if (!notMsgPost) {
          this.msgPost && this.msgPost(msg)
        }
      }

      const errorKey = this.getErrorKey(error)
      if (errorKey) {
        const errorPolicyFunc = this.errorPolicy[errorKey]
        if (isFunction(errorPolicyFunc)) {
          error.errorType = errorKey
          errorPolicyFunc({
            LS: this.LS,
            error,
            location: window.location,
            hackProps,
            msgPost,
            ...(this.errorPolicyProps || {})
          })

          return
        }
      }
      msgPost('系统异常，请联系管理员')
      console.error('未知错误', error)
      throw error
    }
  }

  async fetch(
    url = '',
    data?: any,
    method?: Method,
    headers?: any,
    cancelKey?: string,
    responseType?: ResponseType,
    isReturnResponse?: boolean
  ): Promise<Response | undefined> {
    return await this.fetchByObj({
      url,
      data,
      method,
      headers,
      cancelKey,
      responseType,
      isReturnResponse
    })
  }
}

export default FetchUtil
