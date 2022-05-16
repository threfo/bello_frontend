import { Store, Converter, Configs } from '../interfaces'
import { base64Str2Obj, obj2Base64Str } from '../utils/transform'
import { merge } from '../utils/merge'

export default class StorageCatch extends Store {
  private store: Storage
  converter: Converter
  listeners: Array<any> = []
  constructor(opt: Configs) {
    const {
      notClearKeys = [],
      converter = {
        decode: base64Str2Obj,
        encode: obj2Base64Str
      },
      type = 'localStorage'
    } = opt
    if (
      !localStorage ||
      (type !== 'localStorage' && type !== 'sessionStorage')
    ) {
      throw new Error(
        `can't set ${type} for Storage, only can set localStorage or sessionStorage`
      )
    }

    super()
    this.type = type
    this.store = type === 'localStorage' ? localStorage : sessionStorage
    this.notClearKeys = notClearKeys
    this.converter = converter
  }

  on(fn: (keys: Array<string>) => any): void {
    this.listeners.push(fn)
  }

  get(key: string): any {
    const { decode } = this.converter
    const value = this.store.getItem(key)

    if (!value) {
      return value
    }

    try {
      return decode(value)
    } catch {
      return value
    }
  }
  set(key: string, val: any): string {
    const { encode } = this.converter

    try {
      const value = encode(val)
      this.store.setItem(key, value)

      this.change()
      return value
    } catch {
      throw new Error(`set ${key} fail, please try agin`)
    }
  }

  merge(key: string, val: any): any {
    const value = this.get(key)
    const _value = merge(value, val)
    this.set(key, _value)
    return _value
  }

  clear(): boolean {
    this.store.clear()

    this.change()
    return true
  }

  clearAllExcept(): boolean {
    const keys = Object.keys(this.store)
    if (!keys.length) {
      return true
    }

    const needCleanKeys = keys.filter(key => !this.notClearKeys.includes(key))

    needCleanKeys.forEach(key => {
      this.store.removeItem(key)
    })

    this.change()
    return true
  }

  change(): Storage {
    this.listeners.forEach(fn => {
      fn && fn(this.store)
    })
    return this.store
  }
}
