export * from './apiDataModule'
export * from './offsetModule'
export * from './baseModule'
export * from './userModule'
export * from './eventListenerModule'
export * from './heartbeatReqModule'
export * from './configModule'

export * from './apiDataModule/utils'
export * from './offsetModule/utils'
export * from './userModule/utils'
export * from './eventListenerModule/utils'
export * from './configModule/utils'

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
export const initModulesByModulesFiles = modulesFiles =>
  modulesFiles.keys().reduce((obj: any, modulePath) => {
    // set './app.js' => 'app'
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const value = modulesFiles(modulePath)
    obj[`${moduleName}Module`] = value.default
    return obj
  }, {})
