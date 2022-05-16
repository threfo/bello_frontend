import { Store, Converter, Configs } from '../interfaces'
import { base64Str2Obj, obj2Base64Str } from '../utils/transform'
import { merge } from '../utils/merge'

export default class ChromeStorageCatch extends Store {
  private store: chrome.storage.StorageArea
  converter: Converter
  listeners: any[] = []
  constructor(opt: Configs) {
    const {
      notClearKeys = [],
      converter = {
        decode: base64Str2Obj,
        encode: obj2Base64Str
      },
      type = 'chromeLocalStorage'
    } = opt
    if (
      !chrome?.storage ||
      (type !== 'chromeLocalStorage' && type !== 'chromeSyncStorage')
    ) {
      throw new Error(
        `can't set ${type} for Storage, only can set chromeLocalStorage or chromeSyncStorage`
      )
    }

    super()
    this.type = type
    this.store =
      type === 'chromeLocalStorage' ? chrome.storage.local : chrome.storage.sync
    this.notClearKeys = notClearKeys
    this.converter = converter
  }
  on(fn: (keys: Array<string>) => any): void {
    this.listeners.push(fn)
  }

  get(key: string): Promise<any> {
    const { decode } = this.converter

    return new Promise(resolve => {
      this.store.get(key, data => {
        const value = data?.[key]
        if (!value) {
          resolve(value)
        }

        try {
          return decode(value)
        } catch {
          return value
        }
      })
    })
  }

  set(key: string, val: any): Promise<any> {
    const { encode } = this.converter
    try {
      const value = encode(val)

      return new Promise(resolve => {
        this.store.set({ [key]: value }, () => {
          resolve(value)
          this.change(value)
        })
      })
    } catch {
      throw new Error(`set ${key} fail, please try agin`)
    }
  }

  async merge(key: string, val: any): Promise<any> {
    const value = await this.get('key')
    const _value = merge(value, val)
    await this.set(key, _value)
    return _value
  }

  async clear(): Promise<boolean> {
    await this.store.clear()
    this.change({})
    return true
  }

  async clearAllExcept(): Promise<boolean> {
    const saved: any = {}
    for (const key in this.notClearKeys) {
      const value = await this.get(key)
      saved[key] = value
    }

    await this.clear()
    this.store.set(saved, () => {
      this.change(saved)
    })
    return true
  }

  change(data: any): any {
    this.listeners.forEach(fn => {
      fn && fn(data)
    })
    return data
  }
}
