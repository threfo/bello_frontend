import '@elastic/apm-rum/dist/bundles/elastic-apm-rum.umd.min.js'
import { ApmConfig } from '../helper/interface'

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
export class Apm {
  private static apm: Apm
  public elasticApm
  constructor(payload: ApmConfig) {
    const { userInfo, initConfig } = payload || {}
    this.elasticApm = window.elasticApm.init(initConfig)
    const { user_id } = userInfo || {}
    if (user_id) {
      this.elasticApm.setUserContext({
        id: user_id
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
