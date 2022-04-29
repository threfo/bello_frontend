export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'

export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream'

export default function xhr(url: string, method: Method = 'GET'): any {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open(method, url, true)

    xhr.onload = function (res: ProgressEvent) {
      const { target } = res || {}
      const { response } = (target as XMLHttpRequest) || {}
      resolve(response)
    }
    xhr.onerror = function (err) {
      reject(err)
    }

    xhr.send()
  })
}
