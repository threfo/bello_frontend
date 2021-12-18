import { mergeConfig } from './utils'

export interface I18nMap {
  [key: string]: string
}

export interface I18nLangMap {
  [lang: string]: I18nMap
}

export interface ApiMap {
  [key: string]: string
}

export interface FeatureMap {
  [key: string]: boolean
}

export interface VariableMap {
  [key: string]: any
}

export interface Config {
  i18n?: I18nLangMap
  feature?: FeatureMap
  api?: ApiMap
  variable?: VariableMap
}

export interface ConfigMap {
  [key: string]: Config
}

export interface ConfigModuleState {
  configKeys: string[]
  pathConfigMap: ConfigMap
  [key: string]: ConfigMap | any
}

export type GetConfigFunc = (path: string) => Promise<Config>

export interface ConfigMapFunc {
  [key: string]: GetConfigFunc
}

export interface InitConfigModuleProps {
  LS: any
  Vue: any
  configMapFunc: ConfigMapFunc
}

export const initState = (configKeys: string[], LS) => {
  return configKeys.reduce(
    (obj, key) => {
      obj[key] = LS.get(key) || {}
      return obj
    },
    { configKeys, pathConfigMap: LS.get('pathConfigMap') || {} }
  )
}

export const initConfigModule = ({
  LS,
  Vue,
  configMapFunc
}: InitConfigModuleProps) => {
  const configKeys = Object.keys(configMapFunc)

  return {
    namespaced: true,
    state: initState(configKeys, LS),
    mutations: {
      setPathConfig(state: ConfigModuleState, { path, config, key }): void {
        Vue.set(state[key], path, { ...config })
        LS.set(key, state[key])
      },
      setConfig(state: ConfigModuleState, { config, key }): void {
        state[key] = { ...config }
        LS.set(key, state[key])
      }
    },
    actions: {
      refreshPathConfig({ state, commit }, path) {
        const { configKeys } = state

        const pathConfig = configKeys
          .map(configKey => {
            const configPathMap = state[configKey] || {}

            return configPathMap[path] || {}
          })
          .reduce((obj, configObj) => {
            obj = mergeConfig(configObj, obj)
            return obj
          }, {})

        commit('setPathConfig', {
          path,
          config: pathConfig,
          key: 'pathConfigMap'
        })

        return pathConfig
      },

      async getConfig({ state, commit, dispatch }, { path, passCache }) {
        const { configKeys } = state

        await Promise.all(
          configKeys.map(key => {
            return new Promise(resolve => {
              const cacheData = (state[key] || {})[path]
              if (!cacheData || passCache) {
                configMapFunc[key](path).then(config => {
                  commit('setPathConfig', { path, config, key })
                  resolve(config)
                })
              } else {
                resolve(cacheData)
              }
            })
          })
        )

        return await dispatch('refreshPathConfig', path)
      }
    }
  }
}

export default initConfigModule
