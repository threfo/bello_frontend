export interface TransferData {
  updateJobFormDepartmentOptions?: any
  updateJobFormCustomer?: any
  updateJobFormContact?: any
}
export interface DataConfig {
  eventType: string //需要进行同步的地方标示
  transferData?: TransferData // 要进行同步的内容
}
export interface SourceData {
  source: any //跳转前原始窗口的引用
  origin: string // 信息来源域名
  formWhere: string //消息来源，可用作判断标示
}
export interface EventListenerModuleState {
  eventListenerData: any // 事件处理器数据
  sourceWindowsData: any // 原窗口信息
}

const initState = (): EventListenerModuleState => ({
  eventListenerData: {},
  sourceWindowsData: {}
})

export const initEventListenerModule = ({ Vue }) => ({
  namespaced: true,
  state: initState(),
  mutations: {
    setListenerData(state: EventListenerModuleState, dataConfig: DataConfig) {
      const { eventType, transferData = {} } = dataConfig || {}
      Vue.set(state.eventListenerData, eventType, { ...transferData })
    },
    setSourceWindowsData(
      state: EventListenerModuleState,
      sourceData: SourceData
    ) {
      Vue.set(state, 'sourceWindowsData', { ...sourceData })
    }
  }
})

export default initEventListenerModule
