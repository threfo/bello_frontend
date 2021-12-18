import store from 'store'
import { decode, encode } from 'js-base64'

interface Store {
  key: string
  val: any
}

interface Base64StoreConstructorProps {
  notClearKeys?: string[]
  passLocalStorageB64Key?: string
  isBase64?: boolean
}

class Base64Store {
  notClearKeys: string[] = [
    // 退出登录时候需要保留的
  ]

  passLocalStorageB64Key = 'passLocalStorageB64'
  isBase64 = true

  constructor(props?: Base64StoreConstructorProps) {
    const { notClearKeys, isBase64 = true } = props || {}
    this.notClearKeys = notClearKeys || []
    this.isBase64 = isBase64
  }

  get(key: string): any {
    return this.b64ToUtf8(store.get(key))
  }

  remove(key: string): void {
    store.remove(key)
  }

  set(key: string, val: any): void {
    return store.set(key, this.utf8ToB64(val))
  }

  clear(): void {
    store.clearAll()
  }

  getKeys(): string[] {
    const keys: string[] = []
    store.each((item: any, key: string) => {
      keys.push(key)
    })
    return keys
  }

  clearAllExcept(item?: string | string[]): void {
    const temp: Store[] = []

    if (typeof item === 'string') {
      temp.push({ key: item, val: store.get(item) })
    } else if (Array.isArray(item)) {
      item.forEach(key => {
        temp.push({ key: key, val: store.get(key) })
      })
    } else {
      this.notClearKeys.forEach(key => {
        temp.push({ key: key, val: store.get(key) })
      })
    }

    store.clearAll()

    temp.forEach(obj => {
      if (obj.val) {
        store.set(obj.key, obj.val)
      }
    })
  }

  b64ToUtf8(str: string): any {
    let utfStr = str
    try {
      utfStr = decodeURIComponent(escape(decode(str)))
    } catch (error) {
      // console.warn(error)
    }
    try {
      return JSON.parse(utfStr)
    } catch (error) {
      // console.warn(error)
    }
    return utfStr
  }

  utf8ToB64(str: string): string {
    if (!this.isPass()) {
      try {
        return encode(unescape(encodeURIComponent(JSON.stringify(str))))
      } catch (error) {
        // console.warn(error)
      }
    }
    return str
  }

  isPass(): boolean {
    return !!store.get(this.passLocalStorageB64Key) || !this.isBase64
  }
}

export default Base64Store
