import { parse, stringify } from 'qs'
import { isObject } from 'lodash'

export * from 'qs'

export const isNum = str => /^\d{1,}$/.test(str)

export const isMobile = text =>
  /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/.test(
    text
  )

export const qsObj2Obj = obj => {
  if (Array.isArray(obj)) {
    return obj.map(item => qsObj2Obj(item))
  } else if (isObject(obj)) {
    const returnObj = {}
    Object.keys(obj).forEach(key => {
      let val = obj[key]
      if (val === 'true' || val === 'false') {
        val = val === 'true'
      } else if (isObject(val)) {
        val = qsObj2Obj(val)
      } else if (isNum(val) && !isMobile(val)) {
        val = parseInt(val, 10)
      }
      returnObj[key] = val
    })
    return returnObj
  }
  return obj
}

export const str2Obj = (str: string) => {
  const [, queryStr] = str.split('?')
  return qsObj2Obj(parse(queryStr))
}

export const getQueryStr = (query: any): string => {
  const haveQuery = Object.keys(query || {}).length > 0
  let queryStr = ''
  if (haveQuery) {
    queryStr = `?${stringify(query, {
      skipNulls: true
    })}`
  }

  return queryStr
}

export const isChange = (a, b): boolean =>
  stringify(a, {
    skipNulls: true
  }) !==
  stringify(b, {
    skipNulls: true
  })

export const getUrl = (url: string, q?): string => {
  const [uri, queryStr] = url.split('?')

  let query = {}
  if (queryStr) {
    query = qsObj2Obj(parse(queryStr))
  }

  if (q) {
    query = {
      ...query,
      ...q
    }
  }
  return `${uri}${getQueryStr(query)}`
}

export const removeQueryKeys = (url: string, keys: string[]): string => {
  const [uri] = url.split('?')

  const query = str2Obj(url)

  keys.forEach(key => {
    delete query[key]
  })
  return `${uri}${getQueryStr(query)}`
}
