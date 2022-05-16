import LocalForage from 'localforage'

import { Store, Converter, Configs } from '../interfaces'
import { base64Str2Obj, obj2Base64Str } from '../utils/transform'
import { merge } from '../utils/merge'

export default class IndexedDBCatch extends Store {
  private store: LocalForage
  type: Store['type'] = 'indexedDB'
  converter: Converter
  listeners: Array<any> = []
  constructor(config: Configs) {
    super()

    if (!indexedDB) {
      throw new Error(
        `can't set ${this.type} for Storage, only can set indexedDB`
      )
    }

    const {
      name = '',
      notClearKeys,
      converter = {
        decode: base64Str2Obj,
        encode: obj2Base64Str
      }
    } = config

    this.notClearKeys = notClearKeys
    this.converter = converter

    this.store = LocalForage.createInstance({
      name: `${name}_database`
    })
  }

  on(fn: (keys: Array<string>) => any): void {
    this.listeners.push(fn)
  }

  async get(key: string): Promise<any> {
    const { decode } = this.converter
    const value = await this.store.getItem(key)

    if (!value) {
      return value
    }

    try {
      return decode(value)
    } catch {
      return value
    }
  }

  async set(key: string, val: any): Promise<any> {
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

  async merge(key: string, val: any): Promise<any> {
    const value = await this.get(key)
    const _value = merge(value, val)
    await this.set(key, _value)
    return _value
  }

  async clear(): Promise<boolean> {
    await this.store.clear()

    this.change()
    return true
  }

  async clearAllExcept(): Promise<boolean> {
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

  async change(): Promise<any> {
    this.listeners.forEach(fn => {
      fn && fn(this.store)
    })
    return this.store
  }
}
