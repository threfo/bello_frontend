# btp_f_track

<https://github.com/threfo/btp_f_track>

该项目集成了 bello 前端项目的埋点——`apm上报`以及`exposure曝光`。

## 安装

```javascript
yarn add @belloai/bello-track
```

## 使用

`btp_f_track`是一个 Vue plugin 插件，通过`Vue.use()`即可使用，如：

```javascript
// 引入npm包 @belloai/bello-track
import Track from '@belloai/bello-track'

//注册并使用插件
Vue.use(Track)
```

因为`apm`的上报需要 userinfo 用户信息，`exposure`的曝光需要 token 鉴权，因此`Vue.use(Track, config)`需要传入第二个参数，以对埋点进行初始化。

### 初始化配置 config

config 对象接收 3 个 key

```javascript
{
  eventMap // 埋点时间参数对象
  apmConfig // apm上报初始化配置
  eventConfig // exposure曝光初始化配置
}
// 建议apmConfig和eventConfig初始化的配置通过serverConfig进行配置管理
```

osr 项目中用法如下：<br />`/btp_frontend/src/utils/common/trackUtils.ts`

```javascript
/**
 * 描述: apm初始化配置
 */
const initConfig = {
  serviceName: `${location.hostname.replace(/\./g, '_')}_osr`,
  serverUrl: 'https://stg.belloai.com',
  serviceVersion: '',
  pageLoadTransactionName: 'home',
  transactionDurationThreshold: Number.MAX_SAFE_INTEGER
}
/**
 * 描述: 埋点事件对应的传参
 */
const eventMapParams = {
  view_dashboard: () => ({
    type: 'apm',
    params: {
      name: 'dashboard',
      type: 'view',
      spans: { name: 'view_dashboard' }
    }
  }),
  detail_dashboard: that => {
    console.log('detail_dashboard', that)
    return {
      type: 'event',
      params: {
        trigger: 'click',
        action: 'resume-detail',
        module: 'resume-detail'
      }
    }
  }
}

/**
 * 描述: 获取埋点的配置一初始化埋点plugin
 * @date 2021-09-29
 * @returns {any}
 */
export const getTrackConfig = ({ userInfo, token }) => {
  return {
    eventMap: eventMapParams,
    apmConfig: {
      userInfo,
      initConfig
    },
    eventConfig: {
      reportKey: 'event_osr',
      fetchConfig: {
        url: 'http://localhost:8010/api/exposure/create',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-channel': 'osr'
        }
      }
    }
  }
}
```

### 调用

插件注册后会在`Vue.prototype`原型链上挂载`$trackReport`方法，在项目中使用`$trackReport`后，`build-auth-tree-plugin` webpack 插件会对项目中使用到此埋点方法进行收集，生成一份“路由——埋点”详情的 json，可便于掌控整个项目的埋点情况。<br />使用：<br />`/btp_frontend/src/views/dashboard/index.vue`<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/2777249/1633679044316-4c12b290-1e88-4961-b2ae-e57e298c5f90.png#clientId=u1e538d92-d2d7-4&from=paste&height=186&id=uf4729a25&margin=%5Bobject%20Object%5D&name=image.png&originHeight=372&originWidth=1034&originalType=binary&ratio=1&size=47377&status=done&style=none&taskId=ubdd59388-ac86-4da8-bb34-b3da3fad05f&width=517)<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/2777249/1633679122815-dd3e8477-53eb-4d2e-a1a5-94a694cf95af.png#clientId=u1e538d92-d2d7-4&from=paste&height=521&id=u9413d78b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1042&originWidth=1116&originalType=binary&ratio=1&size=162082&status=done&style=none&taskId=ua5771bb7-6acb-4e38-9c73-b5b7deb187e&width=558)
