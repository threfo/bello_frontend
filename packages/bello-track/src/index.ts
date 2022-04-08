import Apm, { defaultApmConfig } from './apm'
import {
  exposureCreate,
  formatEventParams,
  defaultEventConfig
} from './exposure'
import type { ApmConfig } from './apm'
import type { EventConfig, EventOptions } from './exposure'

interface TrackConfig {
  apmConfig?: ApmConfig
  eventConfig?: EventConfig
}
interface ApmParams {
  name: string
  type: string
  spans: Record<string, string>
  params?: any
}
interface ApmTrackApi {
  (apmParams: ApmParams): void
}
interface EventTrackApi {
  (eventParams: EventOptions | EventOptions[]): void
}
interface TrackApi {
  apmTrack: ApmTrackApi
  eventTrack: EventTrackApi
}

function initApm(apmConfig: ApmConfig): ApmTrackApi {
  const apm = Apm.getInstance(apmConfig)
  return function (apmParams): void {
    const { name = '', type = '', spans = {}, params = {} } = apmParams
    apm.addCountReocord(name, type, spans, params)
  }
}

function initEvent(eventConfig: EventConfig): EventTrackApi {
  return function (eventParams): void {
    const params = formatEventParams(eventConfig, eventParams)
    exposureCreate(params, eventConfig)
  }
}

export default function belloTrack(config: TrackConfig): TrackApi {
  const { apmConfig = {}, eventConfig = {} } = config || {}
  const mergeApmConfig = {
    ...defaultApmConfig,
    ...apmConfig
  } as ApmConfig
  const mergeEventConfig = {
    ...defaultEventConfig,
    ...eventConfig
  } as EventConfig

  const apmTrack = initApm(mergeApmConfig)
  const eventTrack = initEvent(mergeEventConfig)
  return {
    apmTrack,
    eventTrack
  }
}
