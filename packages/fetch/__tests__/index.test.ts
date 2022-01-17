import { checkInterceptConfig } from '../src/index'

describe('packages/fetch/src/index.ts', () => {
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
            url: 'http://aaa.com/url',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            'get /url': {
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
            url: 'http://aaa.com/url',
            method: 'get',
            data: {},
            headers: {
              test: '2',
              test2: '3'
            }
          },
          {
            'POST /url': {
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
        url: 'http://aaa.com/url',
        method: 'get',
        data: {},
        headers: {
          test: '2',
          test2: '3'
        }
      })
    )
  })
})
