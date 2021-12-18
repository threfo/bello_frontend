import { isFunction } from 'lodash'

interface FuncQueue {
  [key: string]: () => void
}

let timer

const funcMap: FuncQueue = {}

export interface HeartbeatReqModuleState {
  dataMap: any
  isStop: boolean
}

const initState = (): HeartbeatReqModuleState => ({
  dataMap: {},
  isStop: false
})

export const initHeartbeatReqModule = ({
  Vue,
  LS,
  heartbeatTime = 5 * 1000,
  lsKey = 'HeartbeatReqCache'
}) => {
  const updateLsValue = (key: string, req) => {
    const cache = LS.get(lsKey) || {}

    cache[key] = {
      lastUpdateTime: new Date().getTime(),
      value: req
    }
    LS.set(lsKey, cache)
  }

  const getLsValue = (key: string) => {
    const cache = LS.get(lsKey) || {}
    return cache[key]
  }

  return {
    namespaced: true,
    state: initState(),
    mutations: {
      setData(state, { key, value }) {
        Vue.set(state.dataMap, key, value)
      },
      setStop(state, isStop) {
        state.isStop = isStop
      }
    },
    actions: {
      start({ commit, dispatch }) {
        commit('setStop', false)
        dispatch('run').then()
      },
      stop({ commit }) {
        commit('setStop', true)
      },

      setFunc(_, { key, func }) {
        funcMap[key] = func
      },
      delFunc(_, key) {
        delete funcMap[key]
      },

      run({ state, dispatch, commit, rootState }) {
        const { isStop, dataMap } = state
        const token = LS.get('token')

        const { token: stateToken } = rootState || {}
        let needReload = isStop && !!token
        if (!needReload) {
          // 打开多个登陆页，在其中一个登陆，然后再在另一个登陆
          needReload = !!stateToken && !!token && stateToken !== token
        }

        if (needReload) {
          window.location.reload()
          return
        }

        if (!token && !isStop) {
          dispatch('tokenTimeout', {}, { root: true })
        } else {
          Object.keys(funcMap).forEach(key => {
            const now = new Date().getTime()
            const { lastUpdateTime = now, value } = getLsValue(key) || {}
            const difTime = now - lastUpdateTime
            const needRunFunc = !value || difTime > heartbeatTime
            const func = funcMap[key]

            if (needRunFunc) {
              if (isFunction(func)) {
                func()
                  .then(req => {
                    updateLsValue(key, req)
                    commit('setData', { key, value: req })
                  })
                  .catch(error => {
                    console.error('error key', key, error)
                  })
              } else {
                console.error(
                  `HeartbeatReq run key: ${key} func is not a function`
                )
              }
            } else {
              if (
                JSON.stringify(dataMap[key] || {}) !==
                JSON.stringify(value || {})
              ) {
                commit('setData', { key, value })
              }
            }
          })
        }

        clearTimeout(timer)
        timer = setTimeout(() => {
          dispatch('run').then()
        }, heartbeatTime)
      }
    }
  }
}

export default initHeartbeatReqModule
