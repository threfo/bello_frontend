import { parse, stringify } from 'qs'
import { isEmpty } from 'lodash'

export const needData = (method): boolean => {
  return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase())
}

export const getUrl = ({ url, method, data, baseUrl }): string => {
  if (url.indexOf('http') < 0) {
    url = baseUrl + url
  }

  const [orgUrl, queryStr] = url.split('?')
  if (method.toUpperCase() === 'GET') {
    let query = parse(queryStr)
    query = {
      ...query,
      ...data
    }

    // 由于后端对 object 的字段处理是直接解析json格式
    Object.keys(query).forEach(key => {
      const value = query[key]
      if (typeof value === 'object') {
        query[key] = JSON.stringify(value)
      }
    })

    if (!isEmpty(query)) {
      url = `${orgUrl}?${stringify(query)}`
    }
  }

  return url
}

export const fixUrl = (url: string, query?: any): string => {
  if (query) {
    return `${url}?${stringify(query)}`
  }
  return url
}
