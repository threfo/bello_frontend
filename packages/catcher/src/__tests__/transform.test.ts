import { base64Str2Obj, obj2Base64Str } from '../utils/transform'

describe('transform', () => {
  it('base64Str2Obj', () => {
    expect(obj2Base64Str({ test: 1 })).toBe('eyJ0ZXN0IjoxfQ==')
    expect(obj2Base64Str(['0', 1, 2, 3])).toBe('WyIwIiwxLDIsM10=')
    expect(obj2Base64Str(null)).toBe('bnVsbA==')
    expect(obj2Base64Str(NaN)).toBe('bnVsbA==')
    expect(obj2Base64Str(undefined)).toBe('dW5kZWZpbmVk')
    expect(obj2Base64Str(0)).toBe('MA==')
    expect(obj2Base64Str('xxxx')).toBe('Inh4eHgi')
    expect(obj2Base64Str(['close', { test: 1, jup: [[2], [3, 'test']] }])).toBe(
      'WyJjbG9zZSIseyJ0ZXN0IjoxLCJqdXAiOltbMl0sWzMsInRlc3QiXV19XQ=='
    )
  })

  it('base64Str2Obj', () => {
    expect(base64Str2Obj('eyJ0ZXN0IjoxfQ')).toEqual({ test: 1 })
    expect(base64Str2Obj('WyIwIiwxLDIsM10=')).toEqual(['0', 1, 2, 3])
    expect(base64Str2Obj('bnVsbA==')).toEqual('')
    expect(base64Str2Obj('dW5kZWZpbmVk')).toEqual('')
    expect(base64Str2Obj('MA==')).toBe(0)
    expect(base64Str2Obj('Inh4eHgi')).toBe('xxxx')
    expect(
      base64Str2Obj(
        'WyJjbG9zZSIseyJ0ZXN0IjoxLCJqdXAiOltbMl0sWzMsInRlc3QiXV19XQ'
      )
    ).toEqual(['close', { test: 1, jup: [[2], [3, 'test']] }])
  })
})
