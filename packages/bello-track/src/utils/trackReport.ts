// apm事件上报
import { Apm } from './apm'
import { eventReport } from './exposure'
import { TrackConfig, TrackParams } from '../helper/interface'
const trackEventMap = {
  apm: async (trackParams, config) => {
    const { apmConfig } = config || {}
    const apm = Apm.getInstance(apmConfig)
    const { name = '', type = '', spans = {}, params = {} } = trackParams
    await apm.addCountReocord(name, type, spans, params)
  },
  event: (trackParams, config) => {
    eventReport(trackParams, config)
  }
}

export function trackReport(params: TrackParams, config: TrackConfig): void {
  const { type, params: trackParams } = params || {}
  const func = trackEventMap[type]
  func(trackParams, config)
}
