import { trackReport } from './utils/trackReport'
import { Vue, TrackConfig, TrackParams } from './helper/interface'

export default {
  install: (Vue: Vue, config: TrackConfig): void => {
    Vue.prototype.$trackReport = function (value) {
      const { eventMap } = config || {}
      const { key } = value || {}
      const params: TrackParams = eventMap[key](this)
      trackReport(params, config)
    }
  }
}
