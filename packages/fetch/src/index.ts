import { FetchUtilProps, FetchProps } from './interface'
import FetchUtil from './FetchUtil'

import Restful from './Restful'

export { checkInterceptConfig } from './interceptApis'

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

export const cleanDefApiHeaders = (config: FetchProps, key = '_apiHeaders') => {
  const { headers } = config

  const afterHeaders = JSON.parse(JSON.stringify(headers))

  const apiHeaders = (window || {})[key] || {}
  Object.keys(apiHeaders).forEach(key => {
    delete afterHeaders[key]
  })
  return afterHeaders
}

export default initApiFactory
