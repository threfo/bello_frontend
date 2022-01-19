import { checkInterceptConfig } from '../src/index'

describe('packages/fetch/src/index.ts', () => {
  beforeEach(() => {
    ;(window as any)._apiHeaders = {
      addHead: 'addHead'
    }
  })

  afterEach(() => {
    delete (window as any)._apiHeaders
  })

  it('checkInterceptConfig', () => {
    expect(
      JSON.stringify(
        checkInterceptConfig(
          {
            url: 'http://aaa.com/url',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            '/url': {
              url: 'http://bbb.com/url1',
              method: 'post',
              headers: {
                test: '1'
              }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        url: 'http://bbb.com/url1',
        method: 'post',
        data: {},
        headers: {
          test: '1',
          test2: '3'
        }
      })
    )

    expect(
      JSON.stringify(
        checkInterceptConfig(
          {
            url: 'http://aaa.com/url?a=1',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            'get /url': {
              url: 'http://bbb.com/url1?b=2',
              method: 'post',
              headers: {
                test: '1'
              }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        url: 'http://bbb.com/url1?a=1&b=2',
        method: 'post',
        data: {},
        headers: {
          test: '1',
          test2: '3'
        }
      })
    )

    expect(
      JSON.stringify(
        checkInterceptConfig(
          {
            url: 'http://aaa.com/url',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            'GET /url': {
              url: 'http://bbb.com/url1',
              method: 'post',
              headers: {
                test: '1'
              }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        url: 'http://bbb.com/url1',
        method: 'post',
        data: {},
        headers: {
          test: '1',
          test2: '3'
        }
      })
    )

    expect(
      JSON.stringify(
        checkInterceptConfig(
          {
            url: 'http://aaa.com/url?a=b',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            'post /url': {
              url: 'http://bbb.com/url1',
              method: 'post',
              headers: {
                test: '1'
              }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        url: 'http://aaa.com/url?a=b',
        method: 'get',
        data: {},
        headers: {
          test: '2',
          test2: '3'
        }
      })
    )

    // 测试host不一致时把系统额外header清空
    expect(
      JSON.stringify(
        checkInterceptConfig(
          {
            url: 'http://aaa.com/url',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3',
              addHead: 'addHead'
            }
          },
          {
            'GET /url': {
              url: 'http://bbb.com/url1',
              method: 'post',
              headers: {
                test: '1'
              }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        url: 'http://bbb.com/url1',
        method: 'post',
        data: {},
        headers: {
          test: '1',
          test2: '3'
        }
      })
    )
  })
})
