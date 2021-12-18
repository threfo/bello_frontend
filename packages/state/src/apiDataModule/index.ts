import { getListByIds } from './utils'

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

const initState = (): ApiDataModuleState => ({
  dataMap: {}
})

export const initApiDataModule = ({
  apiFactory,
  Vue,
  queueLoaderFactory,
  dataPolicy,
  paramsByEntryKeyPolicy
}: InitApiDataModuleProps) => ({
  namespaced: true,
  state: initState(),
  mutations: {
    setData(state: ApiDataModuleState, { entryKey, value }: any): void {
      const { id } = value || {}

      const cacheMap = state.dataMap[entryKey] || {}
      cacheMap[id] = getDataPolicy(entryKey, value, dataPolicy)
      Vue.set(state.dataMap, entryKey, { ...cacheMap })
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
      { state, commit },
      { entryKey, dataId, passLoading, params, passCache = false }: any
    ) {
      let value

      if (!passCache) {
        const { dataMap } = state
        const cacheMap = dataMap[entryKey] || {}
        value = cacheMap[dataId]
      }

      if (!value) {
        const queueLoader = queueLoaderFactory.getQueueLoader({
          key: 'apiDataGetData',
          loadDataFunc: async (props: any) => {
            const { postData } = props

            const { entryKey, dataId } = postData
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
                name: '数据不存在或无权访问',
                is_delete: true
              }
            }

            if (entryData) {
              commit('setData', { entryKey, value: entryData })
            }
            return entryData
          }
        })
        value = await queueLoader.getData({
          postData: { entryKey, dataId },
          passLoading
        })
      }
      return value
    },

    async getListByParams(
      { commit },
      { entryKey, params, hasCacheMap = true }
    ) {
      let list: any[] = []
      try {
        const { items } =
          (await apiFactory.getRestfulApi(entryKey).list({
            ...(params || {}),
            hackProps: { notMsgPost: true }
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

    async getKwList({ dispatch }, { entryKey, q }) {
      const list: any[] = dispatch('getListByParams', {
        entryKey,
        params: {
          q,
          page: 1,
          max_results: 50
        }
      })

      return list
    },

    async getList({ state, dispatch }, { entryKey, dataIds }) {
      const { dataMap } = state
      const cacheMap = dataMap[entryKey] || {}

      return await getListByIds({
        ids: dataIds,
        cache: cacheMap,
        getDataFunc: async noCacheEntityIds => {
          const list: any[] = await dispatch('getListByParams', {
            entryKey,
            params: {
              where: {
                id__in: noCacheEntityIds
              }
            }
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
})

export default initApiDataModule
