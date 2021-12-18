import { isFunction } from 'lodash'

interface OperateConfig {
  key: string //操作对于的state的key 比如：eventListenerDataModule/setSourceWindowsData
  method: string
  eventType?: string //储存到eventListenerDataModule/ListenerData的key
}
interface WindowListenerConfig {
  path: string
  fromWhere: string
  operateConfig: OperateConfig
}

export const initEventListenerModulePolicy = ({
  Store,
  eventListenerModuleName = 'eventListenerModule',
  openPage
}) => {
  const openNewWindowAndListen = ({
    path,
    fromWhere,
    operateConfig
  }: WindowListenerConfig) => {
    const contactWindows = openPage({ path })
    contactWindows.addEventListener('load', () => {
      contactWindows.postMessage(
        { type: 'save_source_origin', fromWhere, operateConfig },
        '*'
      )
    })
  }

  const sendMessageToSourceWindow = data => {
    const { sourceWindowsData } = Store.state[eventListenerModuleName] || {}
    const { source = {}, origin, operateConfig } = sourceWindowsData || {}
    const { key, method, eventType } = operateConfig || {}
    source.postMessage(
      {
        type: 'operate_store',
        key,
        data: { eventType, transferData: data },
        method
      },
      origin
    )
  }

  return {
    policy: {
      // 保存消息来源页面的相关信息
      save_source_origin: event => {
        const { source, origin, data } = event || {}
        const { fromWhere, operateConfig } = data || {}
        Store.commit(`${eventListenerModuleName}/setSourceWindowsData`, {
          source,
          origin,
          fromWhere,
          operateConfig
        })
      },
      // 新开窗口回送消息，根据配置操作store
      operate_store: event => {
        const { data } = event || {}
        const { key, data: storeOperateData, method } = data || {}
        if (method) {
          Store[method](key, storeOperateData)
        } else {
          console.warn('operate_store  method 缺失')
        }
      }
    },
    openNewWindowAndListen,
    sendMessageToSourceWindow
  }
}

export const initWindowMessageEventListener = ({
  windowMessageEventListenerPolicy
}) => {
  const windowMessageEventListener = event => {
    const { data } = event || {}
    const { type } = data || {}
    // console.log('windowMessageEventListener', type, event)
    if (type) {
      const policyFunc = windowMessageEventListenerPolicy()[type]
      if (isFunction(policyFunc)) {
        policyFunc(event)
      }
    }
  }

  return {
    windowMessageEventListener
  }
}
