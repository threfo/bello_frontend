import { merge, isEqual, isString, isObject } from 'lodash'

const debug = true

export const cloneObj = obj => JSON.parse(JSON.stringify(obj || {}))

export const getTagName = item => {
  const { $vnode } = item
  const { tag } = $vnode || {}
  return tag
}

export const getComponentName = item => {
  const tag = getTagName(item)
  const tagNames = (tag || '').split('-')
  const { length } = tagNames || []
  return length === 0 ? tag : tagNames[length - 1]
}

export const componentLog = (that, ...a) => {
  if (debug) {
    console.log(getComponentName(that), ...a)
  }
}

export const getObjByBaseObj = (targetObj, baseObj) => {
  return Object.keys(baseObj || {}).reduce((obj, key) => {
    obj[key] = (targetObj || {})[key]
    return obj
  }, {})
}

export const replaceObjKey = (sourceObj: any, overwriteObj: any) => {
  return cloneObj({
    ...(sourceObj || {}),
    ...(overwriteObj || {})
  })
}

export const getMergeConfigFuncMap = () => {
  return {
    i18n: merge,
    feature: replaceObjKey,
    api: replaceObjKey,
    variable: replaceObjKey
  }
}

export const getNeedConfig = (targetObj: any, sourceObj: any) => {
  return cloneObj(
    Object.keys(sourceObj || {}).reduce((configObj, configKey) => {
      const sourceValue = (sourceObj || {})[configKey] || {}
      const targetValue = (targetObj || {})[configKey]
      if (targetValue !== undefined) {
        if (configKey === 'i18n') {
          configObj[configKey] = Object.keys(sourceValue).reduce(
            (langObj, langKey) => {
              const sourceLangValue = sourceValue[langKey]
              const targetLangValue = targetValue[langKey]

              if (targetLangValue) {
                const newLangObj = getObjByBaseObj(
                  targetLangValue,
                  sourceLangValue
                )
                const { length } = Object.keys(newLangObj)
                if (length) {
                  langObj[langKey] = newLangObj
                }
              }

              return langObj
            },
            {}
          )
        } else {
          const newConfigValue = getObjByBaseObj(targetValue, sourceValue)
          const { length } = Object.keys(newConfigValue)
          if (length) {
            configObj[configKey] = newConfigValue
          }
        }
      }

      return configObj
    }, {})
  )
}

/**
 * 具体看单测
 * @param overwriteObj 用它来做覆盖
 * @param sourceObj 原来的旧对象
 * @returns
 */
export const mergeConfig = (overwriteObj: any, sourceObj: any) => {
  const keyMapFunc = getMergeConfigFuncMap()
  const returnObj = {}
  Object.keys(keyMapFunc).forEach(key => {
    const func = keyMapFunc[key]

    const sourceVal = cloneObj((sourceObj || {})[key] || {})
    const overwriteVal = cloneObj((overwriteObj || {})[key] || {})
    const afterVal = cloneObj(func(sourceVal, overwriteVal))
    returnObj[key] = afterVal
  })

  return cloneObj(returnObj)
}

export const fixUrlParams = (url: string, params?: any): string => {
  if (isObject(params)) {
    const { length } = Object.keys(params)
    if (length) {
      const arr = url.split('/')
      return arr
        .map(i => {
          if (i.startsWith(':')) {
            const v = params[i.replace(':', '')]
            if (v) {
              return v
            }
          }
          return i
        })
        .join('/')
    }
  }
  return url
}

export const getConfigWillSetValue = editValue => {
  let willSetValue = editValue
  try {
    willSetValue = JSON.parse(willSetValue)
  } catch (error) {
    console.warn(error)
  }

  return willSetValue
}

export const savePathConfigSetting = ({ that, commend }) => {
  const { value } = commend || {}
  const { label, editMode, editValue, configKey, cd, lang, isDel, path } =
    value || {}
  const key = `${editMode}Map`
  const willSetValue = getConfigWillSetValue(editValue)

  const configMapData = that[key] || {}
  const pathConfigData = configMapData[path] || {}
  const configKeyData = pathConfigData[configKey] || {}

  let newValue

  if (configKey === 'i18n') {
    const langObj = configKeyData[lang] || {}

    newValue = {
      ...pathConfigData,
      [configKey]: {
        ...configKeyData,
        [lang]: {
          ...langObj,
          [label]: `${willSetValue}`
        }
      }
    }

    if (isDel) {
      delete newValue[configKey][lang][label]
    }
  } else {
    newValue = {
      ...pathConfigData,
      [configKey]: {
        ...configKeyData,
        [label]: willSetValue
      }
    }

    if (isDel) {
      delete newValue[configKey][label]
    }
  }

  that.setPathConfig({ path, config: newValue, key })
  that.refreshPathConfig(path)

  if (cd) {
    cd()
  }

  return {
    path,
    config: newValue,
    key,
    commend,
    configMapData: {
      ...configMapData,
      [path]: newValue
    }
  }
}

export const saveConfigSetting = ({ that, commend }) => {
  const { value } = commend || {}
  const { editMode: key, editValue, cd, path } = value || {}
  const config = getConfigWillSetValue(editValue)

  that.setConfig({ config, key })
  that.refreshPathConfig(path)

  if (cd) {
    cd()
  }

  return {
    path,
    config,
    key,
    commend
  }
}

export const apiPath2Obj = (apiPath: string | any, props?: any) => {
  let data = {}
  let headers = {}
  let method = 'GET'
  let url
  let cancelKey
  let responseType

  if (isString(apiPath)) {
    const [pathMethod, pathUrl, pathCancelKey, pathResponseType] =
      apiPath.split(' ')

    if (pathMethod && pathUrl) {
      method = pathMethod
      url = pathUrl

      if (pathCancelKey) {
        cancelKey = pathCancelKey
      }
      if (pathResponseType) {
        responseType = pathResponseType
      }
    }
  }

  const {
    data: propsData,
    headers: propsHeaders,
    method: propsMethod,
    params,
    ...otherProps
  } = props || {}

  if (propsMethod) {
    method = propsMethod
  }

  if (isObject(propsData)) {
    data = {
      ...(data || {}),
      ...(propsData || {})
    }
  }

  if (isObject(propsHeaders)) {
    headers = {
      ...(headers || {}),
      ...(propsHeaders || {})
    }
  }

  return {
    url: fixUrlParams(url, params),
    data,
    headers,
    method,
    cancelKey,
    responseType,
    ...(otherProps || {})
  }
}

export const getCurrentConfig = ({
  orgPathConfig,
  compConfig,
  $overwriteConfig
}) => {
  const pathConfig = getNeedConfig(orgPathConfig, compConfig)
  const currentConfig = [$overwriteConfig, pathConfig].reduce(
    (obj, config) => {
      return mergeConfig(config || {}, obj)
    },
    {
      ...(compConfig || {})
    }
  )
  return currentConfig
}

/**
 * 提供 config 的mixin
 */
export const initConfigMixin = ({
  configModuleName = 'configModule',
  fetchUtil
}: {
  configModuleName: string
  fetchUtil: any
}) => {
  return {
    props: {
      //父组件的重写
      $overwriteConfig: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      $currentConfig({ $overwriteConfig }) {
        const { config: compConfig } = this.$options || {}

        const { path } = this.$route || {}
        const state = (this.$store?.state || {})[configModuleName] || {}
        const orgPathConfig = (state.pathConfigMap || {})[path] || {}
        const currentConfig = getCurrentConfig({
          orgPathConfig,
          compConfig,
          $overwriteConfig
        })

        return currentConfig
      },
      $variable({ $currentConfig }) {
        const { variable } = $currentConfig || {}
        return variable || {}
      },
      $feature({ $currentConfig }) {
        const { feature } = $currentConfig || {}
        return feature || {}
      },
      $configI18n({ $currentConfig }) {
        const { i18n } = $currentConfig || {}
        const { locale } = this.$i18n || {}
        return (i18n || {})[locale]
      }
    } as any,
    watch: {
      $configI18n: {
        handler(newValue) {
          const { locale, messages } = this.$i18n || {}
          if (newValue && locale) {
            const langObj = messages[locale] || {}
            const afterMerge = {
              ...langObj,
              ...newValue
            }
            const needSetLocaleMessage = !isEqual(afterMerge, langObj)
            if (needSetLocaleMessage) {
              this.$i18n.setLocaleMessage(locale, afterMerge)
            }
          }
        },
        immediate: true
      } as any
    },
    created() {
      const { api } = this.$currentConfig || {}
      // 注册 api 的方法
      Object.keys(api).forEach(key => {
        this[key] = async function (props?: any) {
          const apiPath = ((this.$currentConfig || {}).api || {})[key]

          if (!apiPath) {
            console.error(`not '${key}' api set in config.api`)
            return
          }

          const fetchProps = apiPath2Obj(apiPath, props)
          const { url } = fetchProps || {}

          if (!url) {
            console.error(`'${key}' can't get url`)
            return
          }

          return await fetchUtil.fetchByObj(fetchProps)
        }
      })
    }
  } as any
}
