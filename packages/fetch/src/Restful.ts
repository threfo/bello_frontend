import { Method, Response, ResponseType } from './interface'

import FetchUtil from './FetchUtil'
import { fixUrl } from './utils'

export default class Restful {
  entry: string
  fetchUtil: FetchUtil

  constructor(entry: string, fetchUtil: FetchUtil) {
    this.entry = entry
    this.fetchUtil = fetchUtil
  }

  add(params: any, query?: any): Promise<Response | undefined> {
    const url = fixUrl(`${this.entry}`, query)
    return this.fetchUtil.fetch(url, params, 'POST')
  }

  del(id: string, params: any, query?: any): Promise<Response | undefined> {
    const url = fixUrl(`${this.entry}/${id}`, query)
    return this.fetchUtil.fetch(url, params, 'DELETE')
  }

  update(id: string, params: any, query?: any): Promise<Response | undefined> {
    const url = fixUrl(`${this.entry}/${id}`, query)
    return this.fetchUtil.fetch(url, params, 'PUT')
  }

  list(params: any, lockKey?: string): Promise<Response | undefined> {
    return this.fetchUtil.fetch(`${this.entry}`, params, 'GET', {}, lockKey)
  }

  key(
    key: string,
    params?: any,
    method: Method = 'GET',
    lockKey?: string,
    responseType?: ResponseType,
    isReturnResponse?: boolean
  ): Promise<Response | undefined> {
    return this.fetchUtil.fetch(
      `${this.entry}/${key}`,
      params || {},
      method,
      {},
      lockKey,
      responseType,
      isReturnResponse
    )
  }
}
