import {
  mergeConfig,
  apiPath2Obj,
  fixUrlParams,
  getNeedConfig,
  getCurrentConfig,
  replaceObjKey
} from '../../src/configModule/utils'
describe('packages/state/src/configModule/utils.ts', () => {
  it('replaceObjKey', () => {
    expect(JSON.stringify(replaceObjKey({}, {}))).toBe(JSON.stringify({}))

    expect(
      JSON.stringify(
        replaceObjKey(
          {
            a: true,
            b: false,
            c: false,
            d: true,
            g: true,
            h: false
          },
          {
            a: true,
            b: false,
            c: true,
            d: false,
            e: true,
            f: false
          }
        )
      )
    ).toBe(
      JSON.stringify({
        a: true,
        b: false,
        c: true,
        d: false,
        g: true,
        h: false,
        e: true,
        f: false
      })
    )

    expect(
      JSON.stringify(
        replaceObjKey(
          {
            getUserById: 'get /osr_user/:id',
            delUserById: 'del /osr_user/:id'
          },
          {
            getUserList: 'get /user',
            getUserById: 'get /user/:id'
          }
        )
      )
    ).toBe(
      JSON.stringify({
        getUserById: 'get /user/:id',
        delUserById: 'del /osr_user/:id',
        getUserList: 'get /user'
      })
    )

    expect(
      JSON.stringify(
        replaceObjKey(
          {},
          {
            brandLabel: 'brandLabel',
            brandIs: 'image-load',
            brandProps: null,
            brandPropsSrc: '/img/logo.f1aff188.png',
            brandPropsStyle: { width: '8.125rem' }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        brandLabel: 'brandLabel',
        brandIs: 'image-load',
        brandProps: null,
        brandPropsSrc: '/img/logo.f1aff188.png',
        brandPropsStyle: { width: '8.125rem' }
      })
    )

    expect(
      JSON.stringify(
        replaceObjKey(
          {
            brandLabel: 'brandLabel',
            brandIs: 'image-load',
            brandProps: null,
            brandPropsSrc: '/img/logo.f1aff188.png',
            brandPropsStyle: { width: '8.125rem' }
          },
          {}
        )
      )
    ).toBe(
      JSON.stringify({
        brandLabel: 'brandLabel',
        brandIs: 'image-load',
        brandProps: null,
        brandPropsSrc: '/img/logo.f1aff188.png',
        brandPropsStyle: { width: '8.125rem' }
      })
    )
  })

  it('getCurrentConfig', () => {
    expect(
      JSON.stringify(
        getCurrentConfig({
          orgPathConfig: {
            i18n: {
              'zh-CN': { lang: 'zh', label: '用户 label', sysConfigValue: 111 },
              'en-US': { lang: 'en', label: 'UserConfig label' }
            },
            feature: {},
            api: {
              getUserWechat: 'post /data?table=uni-id-users&action=count'
            },
            variable: {
              sideBarBrandProps: { class: 'mx-12' },
              path: '/main',
              apiPath: 'http://test.cloudfunc.our2b.com'
            }
          },
          compConfig: {
            variable: {
              brandLabel: 'brandLabel',
              brandIs: 'image-load',
              brandProps: null,
              brandPropsSrc: '/img/logo.f1aff188.png',
              brandPropsStyle: { width: '8.125rem' }
            },
            i18n: { 'zh-CN': { brandLabel: '倍罗寻才' } }
          },
          $overwriteConfig: {}
        })
      )
    ).toBe(
      JSON.stringify({
        i18n: { 'zh-CN': { brandLabel: '倍罗寻才' } },
        feature: {},
        api: {},
        variable: {
          brandLabel: 'brandLabel',
          brandIs: 'image-load',
          brandProps: null,
          brandPropsSrc: '/img/logo.f1aff188.png',
          brandPropsStyle: { width: '8.125rem' }
        }
      })
    )
  })

  it('getNeedConfig', () => {
    expect(
      JSON.stringify(
        getNeedConfig(
          {},
          {
            variable: {
              navBarProps: {
                class:
                  'bg-white relative flex items-center justify-between overflow-hidden shadow-md'
              },
              navBarRightProps: { class: 'flex items-center pr-20 py-3' },
              rightComponents: [
                { is: 'UserInfoMenu' },
                { is: 'div', props: { class: 'w-px h-6' } },
                { is: 'Lang' }
              ]
            }
          }
        )
      )
    ).toBe(JSON.stringify({}))

    expect(JSON.stringify(getNeedConfig({}, {}))).toBe(JSON.stringify({}))
    expect(
      JSON.stringify(
        getNeedConfig(
          {
            i18n: {
              a: { a_1: 'a_1', a_2: 'a_2', a_3: 'old_a_3' },
              b: { b_2: 'old_b_2', b_1: 'b_1' }
            },
            feature: {
              a: true,
              b: false
            },
            api: {
              getUserById: 'get /user/:id',
              getUserList: 'get /user'
            },
            variable: {
              a: 'a',
              b: 1,
              c: true,
              d: false,
              e: {
                e_1: 'e_1'
              },
              f: [1],
              g: [{ g_1: 'g_1' }],
              h: 'h'
            }
          },
          {}
        )
      )
    ).toBe(JSON.stringify({}))

    expect(
      JSON.stringify(
        getNeedConfig(
          {
            i18n: {
              a: { a_1: 'a_1', a_2: 'a_2', a_3: 'old_a_3' },
              b: { b_2: 'old_b_2', b_1: 'b_1' }
            },
            feature: {
              a: true,
              b: false
            },
            api: {
              getUserById: 'get /user/:id',
              getUserList: 'get /user'
            },
            variable: {
              a: 'a',
              b: 1,
              c: true,
              d: false,
              e: {
                e_1: 'e_1'
              },
              f: [1],
              g: [{ g_1: 'g_1' }],
              h: 'h'
            }
          },
          {
            i18n: {
              a: { a_2: 'a_2_1' },
              c: { c_1: 'c_1_1' }
            },
            feature: {
              a: false,
              c: false
            },
            api: {
              getUserById: 'get /osr_user/:id',
              delUserById: 'del /osr_user/:id'
            },
            variable: {
              a: 'a_1',
              b: 3,
              f: [2],
              g: [{ g_2: 'g_2' }]
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        i18n: {
          a: { a_2: 'a_2' }
        },
        feature: {
          a: true
        },
        api: {
          getUserById: 'get /user/:id'
        },
        variable: {
          a: 'a',
          b: 1,
          f: [1],
          g: [{ g_1: 'g_1' }]
        }
      })
    )
  })

  it('fixUrlParams', () => {
    expect(fixUrlParams('')).toBe('')
    expect(fixUrlParams(':id')).toBe(':id')
    expect(fixUrlParams(':id/id/aid', {})).toBe(':id/id/aid')
    expect(fixUrlParams(':id/id/aid', { aid: 12 })).toBe(':id/id/aid')
    expect(fixUrlParams(':id/id/aid', { id: 12 })).toBe('12/id/aid')
    expect(fixUrlParams('id/:id/aid', { id: 12 })).toBe('id/12/aid')
    expect(fixUrlParams('id/aid/:id', { id: 12 })).toBe('id/aid/12')
  })

  it('apiPath2Obj', () => {
    expect(JSON.stringify(apiPath2Obj({}, {}))).toBe(
      JSON.stringify({ data: {}, headers: {}, method: 'GET' })
    )
    expect(JSON.stringify(apiPath2Obj({}))).toBe(
      JSON.stringify({ data: {}, headers: {}, method: 'GET' })
    )
    expect(JSON.stringify(apiPath2Obj(''))).toBe(
      JSON.stringify({ data: {}, headers: {}, method: 'GET' })
    )

    expect(JSON.stringify(apiPath2Obj('aa'))).toBe(
      JSON.stringify({ data: {}, headers: {}, method: 'GET' })
    )

    expect(JSON.stringify(apiPath2Obj('get aa'))).toBe(
      JSON.stringify({ url: 'aa', data: {}, headers: {}, method: 'get' })
    )

    expect(JSON.stringify(apiPath2Obj('post aa'))).toBe(
      JSON.stringify({ url: 'aa', data: {}, headers: {}, method: 'post' })
    )

    expect(
      JSON.stringify(apiPath2Obj('post aa pathCancelKey pathResponseType'))
    ).toBe(
      JSON.stringify({
        url: 'aa',
        data: {},
        headers: {},
        method: 'post',
        cancelKey: 'pathCancelKey',
        responseType: 'pathResponseType'
      })
    )

    expect(
      JSON.stringify(
        apiPath2Obj('post aa pathCancelKey pathResponseType', {
          url: 'bb',
          method: 'del',
          data: { a: 'a' },
          headers: { b: 'b' },
          cancelKey: 'cancelKey',
          responseType: 'responseType'
        })
      )
    ).toBe(
      JSON.stringify({
        url: 'bb',
        data: { a: 'a' },
        headers: { b: 'b' },
        method: 'del',
        cancelKey: 'cancelKey',
        responseType: 'responseType'
      })
    )

    expect(
      JSON.stringify(
        apiPath2Obj('post aa/:id pathCancelKey pathResponseType', {
          method: 'del',
          data: { a: 'a' },
          headers: { b: 'b' },
          cancelKey: 'cancelKey',
          responseType: 'responseType',
          params: {
            id: '123'
          }
        })
      )
    ).toBe(
      JSON.stringify({
        url: 'aa/123',
        data: { a: 'a' },
        headers: { b: 'b' },
        method: 'del',
        cancelKey: 'cancelKey',
        responseType: 'responseType'
      })
    )
  })

  it('mergeConfig', () => {
    expect(JSON.stringify(mergeConfig({}, {}))).toBe(
      JSON.stringify({ i18n: {}, feature: {}, api: {}, variable: {} })
    )

    expect(
      JSON.stringify(
        mergeConfig(
          {
            i18n: {
              a: {
                a_1: 'a_1',
                a_2: 'a_2'
              },
              b: {
                b_1: 'b_1'
              }
            },
            feature: {
              a: true,
              b: false,
              c: true,
              d: false,
              e: true,
              f: false
            },
            api: {
              getUserList: 'get /user',
              getUserById: 'get /user/:id'
            },
            variable: {
              a: 'a',
              b: 1,
              c: true,
              d: false,
              e: {
                e_1: 'e_1'
              },
              f: [1],
              g: [{ g_1: 'g_1' }]
            }
          },
          {
            i18n: {
              a: {
                a_1: 'old_a_1',
                a_2: 'old_a_2',
                a_3: 'old_a_3'
              },
              b: {
                b_2: 'old_b_2'
              },
              c: {
                c_1: 'old_c_1'
              }
            },
            feature: {
              a: true,
              b: false,
              c: false,
              d: true,
              g: true,
              h: false
            },
            api: {
              getUserById: 'get /osr_user/:id',
              delUserById: 'del /osr_user/:id'
            },
            variable: {
              a: 1,
              b: 'b',
              c: false,
              d: true,
              e: [1],
              f: {
                e_1: 'e_1'
              },
              g: { g_1: 'g_1' },
              h: 'h'
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        i18n: {
          a: { a_1: 'a_1', a_2: 'a_2', a_3: 'old_a_3' },
          b: { b_2: 'old_b_2', b_1: 'b_1' },
          c: { c_1: 'old_c_1' }
        },
        feature: {
          a: true,
          b: false,
          c: true,
          d: false,
          g: true,
          h: false,
          e: true,
          f: false
        },
        api: {
          getUserById: 'get /user/:id',
          delUserById: 'del /osr_user/:id',
          getUserList: 'get /user'
        },
        variable: {
          a: 'a',
          b: 1,
          c: true,
          d: false,
          e: {
            e_1: 'e_1'
          },
          f: [1],
          g: [{ g_1: 'g_1' }],
          h: 'h'
        }
      })
    )

    expect(
      JSON.stringify(
        mergeConfig(
          { variable: {}, i18n: { 'zh-CN': {} } },
          {
            i18n: { 'zh-CN': { brandLabel: '倍罗寻才' } },
            feature: {},
            api: {},
            variable: {
              brandLabel: 'brandLabel',
              brandIs: 'image-load',
              brandProps: null,
              brandPropsSrc: '/img/logo.f1aff188.png',
              brandPropsStyle: { width: '8.125rem' }
            }
          }
        )
      )
    ).toBe(
      JSON.stringify({
        i18n: { 'zh-CN': { brandLabel: '倍罗寻才' } },
        feature: {},
        api: {},
        variable: {
          brandLabel: 'brandLabel',
          brandIs: 'image-load',
          brandProps: null,
          brandPropsSrc: '/img/logo.f1aff188.png',
          brandPropsStyle: { width: '8.125rem' }
        }
      })
    )
  })
})
