import { TrackConfig, ExtraConfig } from './interface'

const originUrl = window.location.origin
/**
 * 描述: apm初始化配置
 */
const defaultApmConfig = {
  serviceName: `${location.hostname.replace(/\./g, '_')}_osr`,
  serverUrl: originUrl || 'https://stg.belloai.com',
  serviceVersion: '',
  pageLoadTransactionName: 'home',
  transactionDurationThreshold: Number.MAX_SAFE_INTEGER
}
export const getDefaultTrackConfig = (config: ExtraConfig): TrackConfig => {
  const { userInfo, token } = config || {}
  return {
    apmConfig: {
      userInfo,
      initConfig: defaultApmConfig
    },
    eventConfig: {
      reportKey: 'event_osr',
      fetchConfig: {
        url: `${originUrl}/api/exposure/create`,
        token
      }
    }
  }
}
