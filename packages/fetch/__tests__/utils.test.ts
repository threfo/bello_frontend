import { getUrl } from '../src/utils'

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
})
