import { encode, decode } from './base64'

export const base64Str2Obj = (str: string): any => {
  const value = decode(str)
  if (['null', 'undefined'].includes(value)) {
    return ''
  }
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const obj2Base64Str = (obj: any): string => {
  try {
    return encode(JSON.stringify(obj))
  } catch (err) {
    throw new Error(`${err}`)
  }
}
