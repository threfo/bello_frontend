# `@belloai/clipboard`

> clipboard 的复制到剪贴板的常用方法

```js
import { Message } from 'element-ui'
import { copyToClipboard, copyLink } from '@belloai/clipboard'

copyToClipboard('我需要被复制到剪贴板', '复制成功', Message)

copyLink('已经成功复制到当前网址', Message)
```
