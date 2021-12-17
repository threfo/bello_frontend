import { has, isObject, isString, isFunction } from 'lodash'

export const isMaybeResError = resData => {
  return has(resData, 'code') && has(resData, 'data') && has(resData, 'message')
}

export const needThrowCodeError = resData => {
  const { code } = resData || {}

  return code !== 0 && code !== 200
}

export const needThrowResError = resData => {
  return isMaybeResError(resData) && needThrowCodeError(resData)
}

export const isServerError = error => {
  const { response, request } = error || {}

  return !!response && !!request
}

export const getErrorResponseStatus = error => {
  const { response } = error || {}
  const { status } = response || {}

  return status
}

export const isServerCoverError = error => {
  const { response } = error || {}
  const { data } = response || {}
  return isServerError(error) && isObject(data)
}

export const isTooManyReqError = error => {
  return isServerCoverError(error) && getErrorResponseStatus(error) === 429
}

export const getServerCoverErrorCode = error => {
  const { response } = error || {}
  const { data } = response || {}
  const { error: repError } = data || {}
  const { code: repErrorCode } = repError || {}
  return repErrorCode
}

export const isTokenTimeoutError = error => {
  return (
    isServerCoverError(error) &&
    !isTooManyReqError(error) &&
    getServerCoverErrorCode(error) === 401
  )
}

export const isNotAuthError = error => {
  return (
    isServerCoverError(error) &&
    !isTooManyReqError(error) &&
    getServerCoverErrorCode(error) === 403
  )
}

export const getBusinessErrorMsg = error => {
  const { response } = error || {}
  const { data } = response || {}
  const { error: repError } = data || {}
  const { message: repErrorMessage } = repError || {}
  return repErrorMessage
}

export const isBusinessError = error => {
  return !isNotAuthError(error) && !!getBusinessErrorMsg(error)
}

export const getApiErrorMsg = error => {
  const msgMap = {
    '404': '404 未找到资源！',
    '502': '502 服务器跑路啦！',
    '504': '504 服务器跑路啦！'
  }
  const status = getErrorResponseStatus(error)

  return msgMap[`${status || ''}`]
}

export const isApiError = error => {
  const { response } = error || {}
  const { data } = response || {}

  const apiErrorMsg = getApiErrorMsg(error)

  return isServerError(error) && isString(data) && !!apiErrorMsg
}

export const getFetchErrorMsg = error => {
  const { message } = error
  return message
}

export const isCancelReq = error => {
  const { message } = error
  return message === 'cancelReq'
}

export const isFetchError = error => {
  const msg = getFetchErrorMsg(error)
  return !isServerError(error) && !isCancelReq(error) && !!msg
}

export const isExperienceAccountExpired = error => {
  return (
    getServerCoverErrorCode(error) === 400 &&
    getBusinessErrorMsg(error) === '体验账户已过期'
  )
}

// 错误策略，每个策略的返回值为是否需要抛出错误
export const getErrorPolicy = () => {
  return {
    cancelReq: () => {
      throw ''
    },
    tooManyReqError: ({ error, msgPost }) => {
      msgPost('访问过于频繁！')
      throw error
    },
    tokenTimeoutError: () => {
      window.postMessage({ type: 'timeout_from_bg' }, '*')
      throw ''
    },
    notAuthError: ({ LS, error, msgPost }) => {
      const token = LS.get('token')
      if (token) {
        msgPost('您暂无权限进行该操作！')
      }
      throw error
    },
    businessError: ({ error, hackProps, msgPost }) => {
      const { notMsgPost } = hackProps || {}
      if (!notMsgPost) {
        msgPost(getBusinessErrorMsg(error))
      }
      error.errorType = 'businessError'
      throw error
    },
    apiError: ({ error, msgPost }) => {
      msgPost(getApiErrorMsg(error))
      error.errorType = 'apiError'
      throw error
    },
    experienceAccountExpired: ({
      experienceAccountExpiredFunc,
      error,
      msgPost
    }) => {
      experienceAccountExpiredFunc()
      msgPost(getBusinessErrorMsg(error))

      throw error
    },
    fetchError: ({ error, hackProps, msgPost }) => {
      const { notMsgPost } = hackProps || {}
      if (!notMsgPost) {
        msgPost(getFetchErrorMsg(error))
      }
      error.errorType = 'fetchError'

      throw error
    }
  }
}

export const getErrorKeyPolicy = () => {
  return {
    cancelReq: e => isCancelReq(e),
    tooManyReqError: e => isTooManyReqError(e),
    tokenTimeoutError: e => isTokenTimeoutError(e),
    notAuthError: e => isNotAuthError(e),
    experienceAccountExpired: e => isExperienceAccountExpired(e),

    businessError: e => isBusinessError(e),
    apiError: e => isApiError(e),
    fetchError: e => isFetchError(e)
  }
}

export const getErrorKey = (error, errorKeyPolicy): string | undefined => {
  let errorKey
  Object.keys(errorKeyPolicy).forEach(key => {
    if (!errorKey) {
      const func = errorKeyPolicy[key]
      if (isFunction(func)) {
        if (func(error)) {
          errorKey = key
        }
      }
    }
  })
  return errorKey
}
