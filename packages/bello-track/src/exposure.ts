interface ExposureReportKey {
  reportKey?: string
}
export interface EventOptions {
  key: string
  trigger: string
  action: string
  path: string
  data: any
  module: string
  channel: string
}

export interface EventParams {
  events: EventOptions[]
}
export interface EventConfig extends ExposureReportKey {
  method?: string
  url: string
  headers?: any
  token
}

export const defaultEventConfig: Partial<EventConfig> = {
  reportKey: 'event_osr',
  url: `${window.location.origin}/api/exposure/create`
}
export function exposureCreate(
  params: EventParams,
  eventConfig: EventConfig
): void {
  const { url, token, method = 'POST', ...headers } = eventConfig
  try {
    fetch(url, {
      method,
      body: JSON.stringify(params),
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-channel': 'osr',
        ...headers
      }
    })
  } catch (error) {
    console.log('Request Failed', error)
  }
}
export function formatEventParams(
  eventConfig: EventConfig,
  trackParams: EventOptions | EventOptions[]
): EventParams {
  const { reportKey } = eventConfig || {}
  const params: EventParams = { events: [] }
  const option: EventOptions = {
    key: reportKey || 'event_osr',
    trigger: 'click',
    action: '',
    path: window.location.pathname,
    data: null,
    module: '',
    channel: 'osr'
  }
  if (Array.isArray(trackParams)) {
    params.events = trackParams.map(item => ({ ...option, ...item }))
  } else {
    params.events = [{ ...option, ...trackParams }]
  }
  return params
}
