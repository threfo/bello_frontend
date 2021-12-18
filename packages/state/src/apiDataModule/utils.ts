import { chunk, isObject } from 'lodash'

export const getKeyMap2IdMap = (data: any): any => {
  const idMap: any = {}
  Object.keys(data).forEach(key => {
    const val = data[key]
    const { id } = val

    idMap[id] = val
  })
  return idMap
}

export const getIdForApi = (obj: any, key: string) => {
  const data = obj || {}
  let id: any | string = data[key]

  if (isObject(id)) {
    const { id: objId, _id = '' } = (id || {}) as any
    id = objId || _id
  } else if (data[`${key}_id`]) {
    id = data[`${key}_id`]
  } else if (data[`${key}Id`]) {
    id = data[`${key}Id`]
  }

  return id
}

export const getListByIds = async ({ ids, getDataFunc, cache }: any) => {
  const idMap = getKeyMap2IdMap(cache)

  const cacheIds = Object.keys(idMap)

  const noCacheEntityIds: string[] = ids.filter(
    (id: string) => !cacheIds.includes(id)
  )

  const { length } = noCacheEntityIds
  if (length) {
    const limit = 100

    const arr = chunk(noCacheEntityIds, limit)

    for (let index = 0; index < arr.length; index++) {
      const ids = arr[index]
      const list = await getDataFunc(ids)
      list.forEach((value: any) => {
        const { id } = value

        idMap[id] = value
      })
    }
  }
  return ids
    .map((id: string) => {
      const data = idMap[id]
      if (!data) {
        console.warn(`警告：Entity id = ${id} 数据丢失！！！`)
      }

      return data
    })
    .filter((i: any) => i)
}

/**
 * 需要内置 dataId 属性
 */
export const initApiDataMixin = ({
  mapState,
  mapActions,
  entityKey,
  apiDataModuleName = 'apiDataModule'
}) => {
  return {
    computed: {
      ...mapState(apiDataModuleName, ['dataMap']),
      entityData({ dataId, dataMap }) {
        const entityDataMap = (dataMap || {})[entityKey]
        return (entityDataMap || {})[dataId]
      },
      hadCacheData({ entityData }) {
        return !!entityData
      }
    },
    watch: {
      hadCacheData: {
        handler(newValue) {
          const { dataId, getData } = this
          if (dataId && newValue === false && getData) {
            this.getData({
              entryKey: entityKey,
              dataId,
              passCache: true
            }).then()
          }
        },
        immediate: true
      } as any
    },
    methods: {
      ...mapActions(apiDataModuleName, ['getData'])
    }
  } as any
}
