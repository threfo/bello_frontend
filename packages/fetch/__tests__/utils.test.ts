import { getUrl, getSynchronizeApisProps } from '../src/utils'

describe('packages/fetch/src/utils.ts', () => {
  it('getUrl', () => {
    expect(
      getUrl({
        url: 'url',
        method: 'get',
        data: {},
        baseUrl: 'http://localhost/api/'
      })
    ).toBe('http://localhost/api/url')

    expect(
      getUrl({
        url: 'http://url',
        method: 'get',
        data: {},
        baseUrl: 'http://localhost/api/'
      })
    ).toBe('http://url')

    expect(
      getUrl({
        url: 'http://url',
        method: 'get',
        data: { a: 'a', b: { c: '1' } },
        baseUrl: 'http://localhost/api/'
      })
    ).toBe('http://url?a=a&b=%7B%22c%22%3A%221%22%7D')
  })

  it('getSynchronizeApisProps', () => {
    expect(JSON.stringify(getSynchronizeApisProps(undefined))).toBe(
      JSON.stringify([])
    )

    expect(
      JSON.stringify(
        getSynchronizeApisProps({
          props: {
            url: 'url1',
            method: 'method1',
            headers: {
              a: 'a'
            }
          },
          res: {
            config: {
              headers: {
                a: 'a1',
                b: 'b'
              }
            }
          },
          needSynchronizeApis: [
            {
              url: 'url2',
              method: 'method2',
              headers: {
                b: 'b1',
                c: 'c'
              }
            },
            {
              url: 'url3',
              headers: {
                a: 'a3',
                b: 'b1',
                d: 'd'
              }
            },
            {
              headers: {
                b: 'b1',
                d: 'd'
              }
            }
          ]
        })
      )
    ).toBe(
      JSON.stringify([
        {
          url: 'url2',
          method: 'method2',
          headers: { a: 'a1', b: 'b1', c: 'c' }
        },
        { url: 'url3', method: 'GET', headers: { a: 'a3', b: 'b1', d: 'd' } }
      ])
    )
  })
})
