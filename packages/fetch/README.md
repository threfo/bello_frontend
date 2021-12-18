# `fetch`

> api 请求工具

## Usage

```js
import { initApiFactory } from '@belloai/fetch'
import { getFormUtcToLocalMoment } from '@belloai/moment'
import axios from 'axios'
import LS from '@/utils/localStorage'
import { msgPost } from '@/utils/delayMsg'

export const isExpire = (expireAt = '') => {
  const userInfo = LS.get('userInfo')
  if (expireAt || (userInfo && userInfo.expire_at)) {
    const isExpire = getFormUtcToLocalMoment(
      expireAt || userInfo.expire_at
    ).diff(new Date())
    if (isExpire <= 0) {
      LS.clearAllExcept()
      return true
    }
  }
  return false
}

export enum EntryEnum {
  User = 'user'
}

export const apiFactory: any = initApiFactory({
  instance: axios.create(),
  errorPolicyProps: {
    LS
  },
  hostnameMap: {}, // 域名和api的映射
  msgPost,
  getAuthorization: () => {
    const token = LS.get('token')
    return `${token}`
  },
  getCancelSource: () => {
    return axios.CancelToken.source()
  },
  isExpire,
  apiPre: '', // 不定义的的话是 /api/
})

```
