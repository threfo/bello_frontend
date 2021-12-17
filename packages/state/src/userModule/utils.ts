import { UserInfo, UserI18n } from './interface'

import { isFunction } from 'lodash'

export const getUserName = ({
  userInfo,
  attaches = [],
  i18n
}: {
  userInfo: null | UserInfo
  attaches?: string[]
  i18n: UserI18n
}): string => {
  const { name, email, mobile, is_delete = false } = userInfo || {}
  const attachesValues = attaches
    .map(key => (userInfo || {})[key])
    .filter(i => i)
    .join(', ')

  const { notSetUserNameInfo = '未设置名字信息', isDeleteInfo = '(被禁用)' } =
    i18n || {}

  const str = name || email || mobile || notSetUserNameInfo
  if (str && is_delete) {
    return `${str} ${isDeleteInfo}`
  }

  if (attachesValues) {
    return `${str}(${attachesValues})`
  }

  return str
}

export const getShowMap = (props: any) => {
  const { showCompRuleFunc, item, showComp, authMap, getDefaultShowCompFunc } =
    props || {}
  let funcObj = {}
  if (isFunction(showCompRuleFunc)) {
    funcObj = showCompRuleFunc(item || {})
  }
  let defShowMap = {}
  if (isFunction(getDefaultShowCompFunc)) {
    defShowMap = getDefaultShowCompFunc(item || {})
  }

  const { showMap: dateShowMap } = item || {}

  const showMap = {
    ...defShowMap,
    ...(showComp || {}),
    ...funcObj,
    ...(dateShowMap || {})
  }

  if (authMap) {
    Object.keys(authMap).forEach(key => {
      showMap[key] = showMap[key] && authMap[key]
    })
  }

  return showMap
}

export const getJwtPayload = token => {
  let USERINFO = token.split('.')[1]
  USERINFO = new Buffer(USERINFO, 'base64')
  USERINFO = JSON.parse(USERINFO)
  return USERINFO
}
