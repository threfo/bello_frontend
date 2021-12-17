export type IsFetchErrorFunc = (e: any) => boolean

export type ErrorType =
  | 'cancelReq'
  | 'tooManyReqError'
  | 'tokenTimeoutError'
  | 'notAuthError'
  | 'experienceAccountExpired'
  | 'businessError'
  | 'apiError'
  | 'fetchError'

export type ErrorKeyPolicyMap = {
  [key in ErrorType]?: IsFetchErrorFunc
}

export type ErrorPolicyMap = {
  [key in ErrorType]?: (props: any) => void
}

export interface ErrorPolicyProps {
  LS: any
  [key: string]: any
}

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

export interface FetchProps {
  url: string
  data?: any
  method?: Method
  headers?: any
  cancelKey?: string
  responseType?: ResponseType
  isReturnResponse?: boolean
}

export interface FetchUtilProps {
  debug?: boolean
  instance: any
  errorKeyPolicy?: ErrorKeyPolicyMap
  errorPolicy?: ErrorPolicyMap
  hostnameMap?: any
  apiPre?: string
  errorPolicyProps: ErrorPolicyProps
  msgPost: (msg: string) => void
  getAuthorization: () => string
  getCancelSource: () => CancelSource
  needThrowResError?: (resData: Response) => boolean
  isExpire: () => boolean
}

export interface Response {
  code?: number | string
  data?: any
  message?: string
  items?: any[]
  [key: string]: any
}

export interface CancelMap {
  [key: string]: CancelSource
}

export interface CancelSource {
  token: any
  cancel: (key: string) => void
}
