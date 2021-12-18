# heartbeatReqModule

统一心跳请求管理

## 使用

```js
// src/store/modules/heartbeatReq.ts
import Vue from 'vue'
import { initHeartbeatReqModule } from '@2bitlab/state'
import LS from '@/utils/localStorage'

export default initHeartbeatReqModule({
  Vue,
  LS,
  heartbeatTime: 5 * 1000,
  lsKey: 'HeartbeatReqCache'
})
```

### 背景/问题

有些需求实现需要使用类似 settimeout 的方式定时请求服务器获取最新的数据

1、当 token 失效后，这些请求还是会一直的进行，到时服务器资源被浪费和不必要的错误上报

2、开多个 tab 的时候，每一个 tab 都会有一份这样的请求一直在进行，会对服务器造成极大的压力

### 目标

1、token 失效后，停止一切的心跳请求

2、开多个 tab 的时候，只有一个同类型的请求，并把结果同步到全部的 tab

### 方案

可以利用 vuex 的监听及广播机制 加 LocalStorage 来实现。

规范心跳请求的统一调用，在 vuex 的 state 中 添加了 heartbeatReqModule 模块。

通过在 App.vue 监听 state 内的 token 来促发 heartbeatReqModule 中 的 start 和 stop 方法的调用。

heartbeatReqModule 中的 run 方法进行统一的心跳发起，通过厉遍 funcMap 变量中的方法获取需要发起心跳请求的方法。

每次心跳请求的结果返回都会存到 LocalStorage 的 一个变量中，同时记录它的 lastUpdateTime

每次的心跳发起都会先判断 LocalStorage 中是否已经有对应的请求结果，其中的 lastUpdateTime 和当前时间的差值是否大于 心跳频率，在心跳频率内而且 LocalStorage 中的值和当前 state 内的不等时则把值更新到 state 内。

需要发起心情请求的组件只需做以下的几个步骤：

- 1. 定义一个不会重复的 key 值，用于区分和更新心跳请求。
- 2. 使用该 key 值监听 heartbeatReqModule 内的 dataMap 中的值的变量来触发对应的业务逻辑。
- 3. 在符合注册心情请求的地方，注册/更新心跳请求的方法，使用 dispatch('heartbeatReqModule/setFunc', { key, func }) 来注册心跳方法。这里心跳方法必须放回一个 Promise 对象，Promise 的 resolve 结果为你需要触发对应的业务逻辑时的结果。
- 4. 在组件 destroyed 时 注销对应的 心跳请求 this.\$store.dispatch('heartbeatReqModule/delFunc', this.heartbeatReqKey)
