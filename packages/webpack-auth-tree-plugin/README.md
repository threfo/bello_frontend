# bello 鉴权 webpack 插件

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
