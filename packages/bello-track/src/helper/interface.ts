export interface ExtraConfig {
  userInfo?: any
  token: string
  eventMapParams: any
}
export interface ApmConfig {
  userInfo?: any
  initConfig: {
    serviceName: string
    serverUrl: string
    serviceVersion: string
    pageLoadTransactionName: string
    transactionDurationThreshold: number
  }
}
export interface EventConfig {
  reportKey: string
  fetchConfig: {
    method?: string
    url: string
    headers?: any
    token
  }
}

export interface TrackConfig {
  apmConfig: ApmConfig
  eventConfig: EventConfig
}

export interface TrackParams {
  type: string
  params?: any
}
