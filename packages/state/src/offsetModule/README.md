# offsetModule

缓存一些组件的 Offset 值，一般是 height，方便于跨组件高度计算

```js
import Vue from 'vue'

import { initOffsetModule } from '@2bitlab/state'

export default initOffsetModule({
  Vue
})
```

## 还有相关的常用滚动方法

例如：通过 state 监听某个 dom 元素的滚动状态做特殊交互

```vue
<template>
  <div id="domId" :class="className"></div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { initScrollListenerMixin } from '@2bitlab/state'

const scrollListenerMixin = initScrollListenerMixin({
  mapState,
  mapMutations,
  listenerScrollDomId: 'domId',
  offsetModuleName: 'offsetModule'
})

export default {
  mixins: [scrollListenerMixin],
  computed: {
    showTop({ scrollStatus }) {
      return scrollStatus !== 'top'
    },
    className({ scrollStatus }) {
      if (scrollStatus !== 'bottom') {
        return 'bottom-class'
      }
      return ''
    }
  }
}
</script>
```
