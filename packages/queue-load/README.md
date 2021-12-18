# `@belloai/queue-load`

> 队列加载工具

## Usage

```js
import { queueLoaderFactory } from '@belloai/queue-load'

// 声明队列方法
const queueLoader = queueLoaderFactory.getQueueLoader({
  key: 'apiDataGetData', // 队列识别key，会基于这个key建立队列，一种key一个队列
  loadDataFunc: async (props: any) => {
    // 队列需要执行的方法
    const { postData } = props

    // do you want to do

    // 可以和 state 结合做异步联动
    if (entryData) {
      commit('setData', { entryKey, value: entryData })
    }
    return entryData
  }
})

// 执行队列
value = await queueLoader.getData({
  postData: { entryKey, dataId },
  passLoading // 是否跳过队列，为true 时立即执行不进队列，为false时 不会有返回值
})
```
