import '@elastic/apm-rum/dist/bundles/elastic-apm-rum.umd.min.js'
interface UserInfo {
  userId: string
}
export interface ApmConfig extends UserInfo {
  serviceName: string
  serverUrl: string
  serviceVersion: string
  pageLoadTransactionName: string
  transactionDurationThreshold: number
}
declare global {
  interface Window {
    elasticApm: any
  }
}
interface SpansParams {
  // 标记
  name?: string // spans的名字
  type?: string // spans的分类
  params?: Record<string, any> // 详细的标记
}
export const defaultApmConfig: Partial<ApmConfig> = {
  serviceName: `${location.hostname.replace(/\./g, '_')}_osr`,
  serverUrl: window.location.origin || 'https://stg.belloai.com',
  serviceVersion: '',
  pageLoadTransactionName: 'home',
  transactionDurationThreshold: Number.MAX_SAFE_INTEGER
}
export default class Apm {
  private static apm: Apm
  public elasticApm
  constructor(config: ApmConfig) {
    const { userId, ...elasticParams } = config
    this.elasticApm = window.elasticApm.init(elasticParams)
    if (userId) {
      this.elasticApm.setUserContext({
        id: userId
      })
    }
  }
  addCountReocord(name = '', type = '', spans: SpansParams, params = {}): void {
    const transaction = this.elasticApm.startTransaction(
      name || 'unknow',
      type || 'custom'
    )
    transaction.startSpan(spans.name || 'unknow', spans.type || 'custom')
    const transactionName = type === 'page_view' ? 'page_name' : 'action_name'
    transaction.addLabels({ [transactionName]: spans.name || 'unknow' })
    for (const key in params) {
      transaction.addLabels({ [key]: params[key] })
    }
    setTimeout(() => {
      transaction.end()
    })
  }
  public static getInstance(apmConfig: ApmConfig): Apm {
    if (!Apm.apm) {
      Apm.apm = new Apm(apmConfig)
    }
    return Apm.apm
  }
}
