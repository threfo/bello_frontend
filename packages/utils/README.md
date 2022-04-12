# `utils`

> 常用的工具方法

## Usage

```js
import { timerHelper, contextHelper } from '@belloai/utils'

// 自动维护 setTimeout 的内存，不会重复定义，每次定义前都会清理掉 同key内的 setTimeout
timerHelper.setTimeout(() => {}, 1000, 'key')

// 自动维护 addListener 的方法调用，不会重复定义，可以让整个项目有进行 addListener 的内容更清晰
const tabsOnRemovedListener = () => {
  // xxx
}
const cxt = contextHelper.initContext(
  {
    contextWindow: window,
    needInitWindowLister: [
      ['chrome.tabs.onRemoved', [tabsOnRemovedListener]]
      // 等同于
      // window.chrome.tabs.onRemoved.removeListener(tabsOnRemovedListener)
      // window.chrome.tabs.onRemoved.addListener(tabsOnRemovedListener)
    ]
  },
  () => {
    // 其他事情
  }
)
// 当需要注销时
cxt.removeWindowListener()
```
