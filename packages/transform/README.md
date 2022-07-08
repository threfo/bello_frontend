# `@belloai/transform`

> api 数据转组件用到的数据体

## Usage

```js
const Ls = require('@belloai/transform')

const ls = new Ls({
  notClearKeys: ['a'],
  passLocalStorageB64Key: 'b'
})

ls.set('a', 'aaaa')
ls.get('a') // 'aaaa'

ls.set('c', 'cccc')
ls.get('c') // 'cccc'

ls.getKeys() // ['a','c']

ls.clearAllExcept()

ls.getKeys() // ['a']
ls.get('a') // 'aaaa'
ls.get('c') // ''

ls.clear()

ls.getKeys() // []

ls.set('d', 'dddd')
ls.get('d') // 'dddd'
ls.remove('d')
ls.get('d') // ''
```
