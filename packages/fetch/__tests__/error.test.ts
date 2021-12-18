import {
  isMaybeResError,
  needThrowCodeError,
  needThrowResError,
  isServerError,
  isTooManyReqError,
  isTokenTimeoutError,
  isNotAuthError,
  getBusinessErrorMsg,
  isBusinessError,
  getServerCoverErrorCode,
  getErrorResponseStatus,
  isApiError,
  getApiErrorMsg,
  isFetchError,
  isCancelReq,
  isExperienceAccountExpired,
  getErrorKey,
  getFetchErrorMsg,
  getErrorKeyPolicy
} from '../src/error'

describe('packages/fetch/src/error.ts', () => {
  it('getFetchErrorMsg', () => {
    expect(getFetchErrorMsg(new Error('xxxx'))).toBe('xxxx')
  })

  it('getErrorKey', () => {
    expect(getErrorKey(new Error('xxxx'), getErrorKeyPolicy())).toBe(
      'fetchError'
    )
  })
  it('isMaybeResError', () => {
    expect(
      isMaybeResError({
        code: 'code',
        data: 'data',
        message: 'message'
      })
    ).toBe(true)
    expect(
      isMaybeResError({
        code: 'code',
        message: 'message'
      })
    ).toBe(false)

    expect(
      isMaybeResError({
        code: 'code',
        message: 'message'
      })
    ).toBe(false)
    expect(
      isMaybeResError({
        code: 'code',
        data: 'data'
      })
    ).toBe(false)
  })

  it('needThrowCodeError', () => {
    expect(
      needThrowCodeError({
        code: 0
      })
    ).toBe(false)

    expect(
      needThrowCodeError({
        code: 200
      })
    ).toBe(false)
    expect(needThrowCodeError({})).toBe(true)

    expect(needThrowCodeError({ code: -1 })).toBe(true)
    expect(needThrowCodeError({ code: 1 })).toBe(true)
    expect(needThrowCodeError({ code: 199 })).toBe(true)
    expect(needThrowCodeError({ code: 201 })).toBe(true)
  })

  it('needThrowResError', () => {
    expect(
      needThrowResError({
        code: 0,
        data: 'data',
        message: 'message'
      })
    ).toBe(false)

    expect(
      needThrowResError({
        code: 200,
        data: 'data',
        message: 'message'
      })
    ).toBe(false)

    expect(needThrowResError({})).toBe(false)

    expect(
      needThrowResError({
        code: 1,
        data: 'data',
        message: 'message'
      })
    ).toBe(true)
  })

  it('isServerError', () => {
    expect(
      isServerError({
        message: 'message',
        request: {}
      })
    ).toBe(false)

    expect(
      isServerError({
        message: 'message',
        response: {},
        request: {}
      })
    ).toBe(true)
  })

  it('getErrorResponseStatus', () => {
    expect(
      getErrorResponseStatus({
        response: { status: 429 },
        request: {}
      })
    ).toBe(429)
  })

  it('isTooManyReqError', () => {
    expect(
      isTooManyReqError({
        response: { status: 429, data: {} },
        request: {}
      })
    ).toBe(true)
  })

  it('getServerCoverErrorCode', () => {
    expect(
      getServerCoverErrorCode({
        response: {
          data: {
            error: {
              code: 401
            }
          }
        },
        request: {}
      })
    ).toBe(401)
  })

  it('isTokenTimeoutError', () => {
    expect(
      isTokenTimeoutError({
        response: {
          data: {
            error: {
              code: 401
            }
          }
        },
        request: {}
      })
    ).toBe(true)
  })

  it('isNotAuthError', () => {
    expect(
      isNotAuthError({
        response: {
          data: {
            error: {
              code: 403
            }
          }
        },
        request: {}
      })
    ).toBe(true)
  })

  it('getBusinessErrorMsg', () => {
    expect(
      getBusinessErrorMsg({
        response: {
          data: {
            error: {
              message: 'message'
            }
          }
        },
        request: {}
      })
    ).toBe('message')
  })

  it('isBusinessError', () => {
    expect(
      isBusinessError({
        response: {
          data: {
            error: {
              code: 41200,
              message: 'message'
            }
          }
        },
        request: {}
      })
    ).toBe(true)

    expect(
      isBusinessError({
        response: {
          data: {
            error: {
              code: 403,
              message: 'message'
            }
          }
        },
        request: {}
      })
    ).toBe(false)
  })

  it('getApiErrorMsg', () => {
    expect(
      getApiErrorMsg({
        response: {
          data: 'data',
          status: 404
        },
        request: {}
      })
    ).toBe('404 未找到资源！')
    expect(
      getApiErrorMsg({
        response: {
          data: 'data',
          status: 502
        },
        request: {}
      })
    ).toBe('502 服务器跑路啦！')
    expect(
      getApiErrorMsg({
        response: {
          data: 'data',
          status: 504
        },
        request: {}
      })
    ).toBe('504 服务器跑路啦！')

    expect(
      getApiErrorMsg({
        response: {
          data: 'data',
          status: 200
        },
        request: {}
      })
    ).toBeUndefined()
  })

  it('isApiError', () => {
    expect(
      isApiError({
        response: {
          data: 'data',
          status: 404
        },
        request: {}
      })
    ).toBe(true)
    expect(
      isApiError({
        response: {
          data: 'data',
          status: 502
        },
        request: {}
      })
    ).toBe(true)
    expect(
      isApiError({
        response: {
          data: 'data',
          status: 504
        },
        request: {}
      })
    ).toBe(true)

    expect(
      isApiError({
        response: {
          data: 'data',
          status: 200
        },
        request: {}
      })
    ).toBe(false)
  })

  it('isCancelReq', () => {
    expect(
      isCancelReq({
        message: 'cancelReq'
      })
    ).toBe(true)
  })

  it('isExperienceAccountExpired', () => {
    expect(
      isExperienceAccountExpired({
        response: {
          data: {
            error: {
              code: 400,
              message: '体验账户已过期'
            }
          }
        },
        request: {}
      })
    ).toBe(true)
  })

  it('isFetchError', () => {
    expect(
      isFetchError({
        message: 'cancelReq'
      })
    ).toBe(false)

    expect(
      isFetchError({
        message: 'abc'
      })
    ).toBe(true)
  })
})
