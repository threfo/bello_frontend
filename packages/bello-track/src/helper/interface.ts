export interface Vue {
  prototype: {
    $trackReport: (value: any) => void
  }
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
    headers: {
      Authorization: string
      'x-channel': string
      'Cache-Control'?: string
      Accept?: string
      'Content-Type'?: string
    }
  }
}

export interface TrackConfig {
  eventMap: any
  apmConfig: ApmConfig
  eventConfig: EventConfig
}

export interface TrackParams {
  type: string
  params?: any
}
