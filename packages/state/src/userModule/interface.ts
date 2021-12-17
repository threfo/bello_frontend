export interface UserInfo {
  id?: string
  name?: string
  headimgurl?: string
  username?: string
  is_delete?: boolean
  mobile?: string
  email?: string
  expire_at?: string
  [key: string]: any
}

export interface UserI18n {
  notSetUserNameInfo?: string
  isDeleteInfo?: string
}
