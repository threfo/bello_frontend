import { getListByIds } from './utils'
import TypeArrMapControl from './TypeArrMapControl'

export interface DataMap {
  [key: string]: any
}

export interface ApiDataModuleState {
  dataMap: DataMap
  [key: string]: any
}

export interface ApiData {
  id?: string
  _id?: string
  [key: string]: any | ApiData
}

export interface InitApiDataModuleProps {
  apiFactory: any
  Vue: any
  queueLoaderFactory: any
  dataPolicy?: any // 存储某个EntryKey的 data 的时候的策略
  paramsByEntryKeyPolicy?: any // 请求某个EntryKey的 data 的时候的策略
  getIdsListProps?: any // 当getData同类型的进队列后改成list请求时的query构建规则方法
  loadErrorText?: string // 没有找到数据时显示的文案
}

const defGetData = ({ id, name, is_delete, disabled }: any) => ({
  id,
  name,
  is_delete,
  disabled
})

const defGetParams = (params: any) => params

const getDataPolicy = (entryKey: string, data: any, funcMap: any) => {
  const func = (funcMap || {})[entryKey] || defGetData
  return func(data)
}

const getParamsByEntryKey = (entryKey: string, params?: any, funcMap?: any) => {
  const func = (funcMap || {})[entryKey] || defGetParams
  return func(params)
}

const defGetIdsListProps = ids => ({
  where: {
    id__in: ids
  },
  max_results: ids.length
})

const initState = (): ApiDataModuleState => ({
  dataMap: {}
})

export const initApiDataModule = ({
  apiFactory,
  Vue,
  queueLoaderFactory,
  dataPolicy,
  paramsByEntryKeyPolicy,
  getIdsListProps = defGetIdsListProps,
  loadErrorText = '数据不存在或无权访问'
}: InitApiDataModuleProps) => {
  const typeArrMapControl = new TypeArrMapControl()

  const getIdQueue = async props => {
    const {
      entryKey: propsEntryKey,
      dataId: propsDataId,
      params: propsParams,
      commit,
      passLoading
    } = props || {}

    const queueLoader = queueLoaderFactory.getQueueLoader({
      key: 'apiDataGetData',
      loadDataFunc: async loadDataProps => {
        const { postData } = loadDataProps

        const { entryKey, dataId, params } = postData
        let entryData
        try {
          entryData = await apiFactory.getRestfulApi(entryKey).key(
            dataId,
            getParamsByEntryKey(
              entryKey,
              {
                ...(params || {}),
                hackProps: { notMsgPost: true }
              },
              paramsByEntryKeyPolicy
            )
          )
        } catch (error) {
          console.error(error)
          entryData = {
            id: dataId,
            name: loadErrorText,
            is_delete: true
          }
        }

        if (entryData) {
          commit('setData', { entryKey, value: entryData })
        }
        return entryData
      }
    })

    return await queueLoader.getData({
      postData: {
        entryKey: propsEntryKey,
        dataId: propsDataId,
        params: propsParams
      },
      passLoading
    })
  }

  let timer

  return {
    namespaced: true,
    state: initState(),
    mutations: {
      setData(state: ApiDataModuleState, { entryKey, value }: any): void {
        const { id } = value || {}

        const cacheMap = state.dataMap[entryKey] || {}
        cacheMap[id] = getDataPolicy(entryKey, value, dataPolicy)
        Vue.set(state.dataMap, entryKey, { ...cacheMap })
        typeArrMapControl.popInQueue({ dataId: id, entryKey })
      },
      setListData(
        state: ApiDataModuleState,
        { entryKey, list, hasCacheMap = true }: any
      ): void {
        const stateValue = state.dataMap[entryKey] || {}
        const cacheMap = hasCacheMap ? stateValue : {}
        list.forEach((value: any) => {
          const { id } = value

          if (id) {
            cacheMap[id] = getDataPolicy(entryKey, value, dataPolicy)
            typeArrMapControl.popInQueue({ dataId: id, entryKey })
          }
        })
        Vue.set(state.dataMap, entryKey, { ...cacheMap })
      },

      reset(state: ApiDataModuleState) {
        const val = initState()
        Object.keys(val).forEach((key: string) => {
          state[key] = val[key]
        })
      }
    },
    actions: {
      async getData(
        { state, commit, dispatch },
        { entryKey, dataId, passLoading, params, passCache = false }: any
      ) {
        let value

        if (!passCache) {
          const { dataMap } = state
          const cacheMap = dataMap[entryKey] || {}
          value = cacheMap[dataId]
        }

        if (!value) {
          if (passLoading || Object.keys(params || {}).length) {
            value = await getIdQueue({
              entryKey,
              dataId,
              params,
              commit,
              passLoading
            })
          } else {
            typeArrMapControl.pushInQueue({ entryKey, dataId })
            clearTimeout(timer)

            timer = setTimeout(() => {
              const ids = typeArrMapControl.getArr(entryKey)
              if (ids.length) {
                dispatch('getListByParams', {
                  entryKey,
                  params: getIdsListProps(ids)
                })
              }
            }, 300)
          }
        }
        return value
      },

      async getListByParams(
        { commit },
        { entryKey, params, hasCacheMap = true, lockKey = '' }
      ) {
        let list: any[] = []
        try {
          const { items } =
            (await apiFactory.getRestfulApi(entryKey).list({
              ...(params || {}),
              hackProps: { notMsgPost: true },
              lockKey
            })) || {}

          list = items || []
        } catch (error) {
          console.error('getList', error)
        }

        commit('setListData', {
          entryKey,
          list,
          hasCacheMap
        })

        return list
      },

      async getKwList({ dispatch }, { entryKey, q, params }) {
        const list: any[] = dispatch('getListByParams', {
          entryKey,
          params: {
            q,
            page: 1,
            max_results: 50,
            ...(params || {})
          }
        })

        return list
      },

      async getList({ state, dispatch }, { entryKey, dataIds, lockKey = '' }) {
        const { dataMap } = state
        const cacheMap = dataMap[entryKey] || {}

        return await getListByIds({
          ids: dataIds,
          cache: cacheMap,
          getDataFunc: async noCacheEntityIds => {
            const list: any[] = await dispatch('getListByParams', {
              entryKey,
              params: getIdsListProps(noCacheEntityIds),
              lockKey
            })

            return list
          }
        })
      },
      refreshData({ commit, state }, { entryKey, value }) {
        const { dataMap } = state
        const cacheMap = dataMap[entryKey] || {}
        const { id: dataId } = value
        if (cacheMap[dataId]) {
          commit('setData', { entryKey, value })
        }
      }
    }
  }
}
export default initApiDataModule
