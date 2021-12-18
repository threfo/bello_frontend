import { FetchUtilProps } from './interface'
import FetchUtil from './FetchUtil'

import Restful from './Restful'

export const initApiFactory = (props: FetchUtilProps) => {
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

export default initApiFactory
