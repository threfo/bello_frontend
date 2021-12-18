# `ls`

> 带有 `Base64` 加密能力的 `LocalStorage`

## Usage

```js
const Ls = require('@belloai/ls')

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
