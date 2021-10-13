import { TrackConfig, TrackParams } from '../helper/interface'
// eventReport事件上报
function exposureCreate(data, fetchConfig) {
  const { url, token, ...config } = fetchConfig
  const { headers, ...baseConfig } = config
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-channel': 'osr',
      ...headers
    },
    ...baseConfig
  }).then(() => console.log('response suceess')) // parses response to JSON
}

export const eventReport = async (
  trackParams: TrackParams,
  config: TrackConfig
): Promise<void> => {
  try {
    const { eventConfig } = config || {}
    const { reportKey, fetchConfig } = eventConfig || {}
    const params: any = { events: [] }
    const option = {
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
    await exposureCreate(params, fetchConfig)
  } catch (error) {
    console.error(error)
  }
}
