export interface Configs {
  type: string
  notClearKeys: string[]
  converter?: Converter
  name?: string
}

export interface Converter {
  decode(val: any): any
  encode(val: any): any
}

export abstract class Store {
  type:
    | 'chromeLocalStorage'
    | 'chromeSyncStorage'
    | 'localStorage'
    | 'sessionStorage'
    | 'indexedDB'
    | '' = ''
  notClearKeys: string[] = []
  abstract converter: Converter
  abstract listeners: any[]
  abstract get(key: string): any | Promise<any>
  abstract set<T>(key: string, value: T): T | Promise<T>
  abstract set<T>(key: string, value: T, type: 'sync | local'): T | Promise<T>
  abstract clear(): boolean | Promise<boolean>
  abstract clearAllExcept(): boolean | Promise<boolean>
  abstract on(fn: any): void
  abstract change(data?: any): any | Promise<any>
}
