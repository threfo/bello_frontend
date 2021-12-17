# eventListenerModule

同步数据的跨页面操作

```js
// src/store/modules/eventListener.ts
import Vue from 'vue'
import { initEventListenerModule } from '@2bitlab/state'

export default initEventListenerModule({
  Vue
})
```

```js
// src/utils/windowEventListen.ts
// 尽量使用vuex 来做联动效果

import Store from '@/store'
import { routerUtil } from '@/router'

import {
  initEventListenerModulePolicy,
  initWindowMessageEventListener
} from '@2bitlab/state'

const eventListenerModulePolicy = initEventListenerModulePolicy({
  Store,
  eventListenerModuleName: 'eventListenerModule',
  openPage: (to, target) => routerUtil.openPage(to, target)
})

export const { openNewWindowAndListen, sendMessageToSourceWindow } =
  eventListenerModulePolicy

const { policy: eventListenerModulePolicy } = eventListenerModulePolicy

export const { windowMessageEventListener } = initWindowMessageEventListener({
  windowMessageEventListenerPolicy: () => ({
    ...eventListenerModulePolicy,
    timeout_from_bg: () => {
      // console.log('windowMessageEventListener timeout_from_bg')
      Store.dispatch('userModule/tokenTimeout')
    }
  })
})
```

可以利用 `@/src/store/modules/eventListener.ts` 加 `@/utils/windowEventListen` 内的策略来实现。

## 使用方法

1.在 A 页面组件的跳转方法中添加

```js
import { openNewWindowAndListen } from '@/utils/windowEventListen'
openNewWindowAndListen(<path>,<formWhere>,<operateConfig>)
//path =>新开页面的路径如：'/main/customer-manage-new'
// formWhere => 给新开页面的信息 可用做标示
// operateConfig => 配置 储存B页面返回结果 的位置
```

2.在接受处理的 B 页面组件中添加

```js
import { sendMessageToSourceWindow } from '@/utils/windowEventListen'
const { formWhere } =
  this.$store.state.eventListenerModule.sourceWindowsData || {}
if (this.fromWhere === 'openFromJD') {
  const toSourceWindowData = {} // B页面处理好的数据
  sendMessageToSourceWindow(toSourceWindowData)
}
```

3.在需要同步的 A 页面组件中监听`operateConfig`中配置的 store，这里以`eventListenerModule`为例子

```js

computer:{
  needUpdateDepartmentOptions() {
    const { eventListener } =
      this.$store.state.eventListenerModule || {}
    const { <eventType> } = eventListener || {}
    return <eventType> //operateConfig中的eventType
  },
},
watch:{
needUpdateDepartmentOptions(newValue){
  // ....对newValue的一些处理
}
}

```
