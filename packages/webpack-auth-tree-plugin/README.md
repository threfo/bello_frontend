# bello 鉴权 webpack 插件

收集代码内的权限配置结合 `routesPath` 和 `menuPath` 构建出权限分布 json

```js
const BuildAuthTreePlugin = require('@belloai/webpack-auth-tree-plugin')

const chainWebPackConfig = config => {
  config.plugin('build-auth-tree-plugin').use(BuildAuthTreePlugin, [
    {
      routesPath: getPath('../../src/router/routes.ts'),
      menuPath: getPath('../../src/router/menu.ts')
    }
  ])
}
```

```html
<div v-if="$auth('authType')">当我有对应的`authType`权限了才会显示哟</div>
```

例子

```js
// 路由配置
{
  path: '/main/resume-detail',
  component: import('/viewsresume-manage/detail'),
  meta: {
    name: '简历详情',
    order: 1,
    parent: {
      name: '简历管理'
    },
    activePath: '/main/resume-manage',
    authType: 'view_etp'
  }
}
```

在 `/viewsresume-manage/detail.vue` 上有以下代码块

```html
<auth name="简历编辑" eleKey="editBtn" eleType="btn">
  <el-button v-if="$auth('add_resume','新增简历')">简历编辑</el-button>
</auth>
<div v-if="$auth('add_resume','新增简历')">新增简历</div>
```

保存后，在 `build/auth_json.json` 内就会自动生成了以下的 json 片段

```json
{
  "view_etp": [
    {
      ...
      "views": [
        {
          "name": "简历详情",
          "key": "view_etp#/main/resume-detail",
          "eles": [
            {
              "key": "view_etp#/main/resume-detail#editBtn",
              "name": "简历编辑",
              "eleType": "btn"
            }
          ],
          "funcs": [
            {
              "key": "add_resume",
              "msg": "新增简历"
            },
          ]
        }
      ]
    }
  ]
}

```

然后项目在服务器部署时，会自动的把这份 json 数据更新到数据库，在管理后台的权限配置功能上就会出现该权限按钮的配置项。

如果用户只配置了 `view_etp` 这个权限，没有配置`view_etp`下的其他权限，则所有带有`view_etp`的权限块都会生效显示，如果有配置`view_etp`下的其他权限，例如 `view_etp#/main/resume-detail#editBtn`，则按照真是的拥有的权限来显示带有`view_etp`的权限块。

在项目启动/代码更新时，就会出现 auth json 构建的情况报告

```bash
BuildAuthTreePlugin done, auth json 构建开始解析
/Users/thomaslau/Projects/btp_frontend/build/routes_json.json file save success
/Users/thomaslau/Projects/btp_frontend/build/menu_json.json file save success
/Users/thomaslau/Projects/btp_frontend/build/auth_json.json file save success
共分析了 400 个文件，
    路由: 63 个，
    权限模块: 28 个，
    有使用到<auth>标签的页面共: 0 个,
    有使用到$auth方法的页面共: 26 个,
    耗时 24.11s
```

如果有新的写法导致解析出错，会有异常提示，请及时维护

试验项目 <https://github.com/threfo/auth_demo>

- [x] 做成 npm，webpack 的 plugin 包

## 注意事项

1. `$auth` 的信息收集只限于`.vue` 文件
2. `$auth` 的写法暂时只支持常量方法，没有做变量值分析。

```js
const auth1 = 'test1'
if (this.$auth(auth1， '权限1')) {
  // 这个是解析不了的
}

if (this.$auth('test2', '权限2')) {
  // 这个才会解析到
}

```
