# bello 鉴权插件

> 使用规范

- 该包包含方法 `WebpackPlugin`,`VuePlugin`使用场景分为以下方式：

  - `WebpackPlugin`

  ```js
  const {
    WebpackPlugins: BuildAuthTreePlugin
  } = require('@belloai/webpack-auth-tree-plugin')

  const chainWebPackConfig = config => {
    config.plugin('build-auth-tree-plugin').use(BuildAuthTreePlugin, [
      {
        routesPath: getPath('../../src/router/routes.ts'),
        menuPath: getPath('../../src/router/menu.ts')
      }
    ])
  }
  ```

  - `VuePlugin`
    1. 注意点 使用时 需要在 `store.state` 内声明 `permission`, 作为权限集合，所有权限基于该数据进行鉴权
    2. !!!`new VuePlugin`时，会接受一个 authFn 鉴权的方法，如果有传递，可以忽略注意点 1

  ```js
  import { VuePlugins } from '@belloai/webpack-auth-tree-plugin'
  const auth = new VuePlugins()

  Vue.use(auth)
  ```
