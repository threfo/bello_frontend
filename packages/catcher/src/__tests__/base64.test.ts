import { encode, decode } from '../utils/base64'

describe('base64', () => {
  it('atob && encode', () => {
    expect(encode('')).toBe('')
    expect(decode('')).toBe('')

    expect(encode('1234')).toBe('MTIzNA==')
    expect(decode('MTIzNA')).toBe('1234')

    expect(encode(' ')).toBe('IA==')
    expect(decode('IA==')).toBe(' ')

    expect(encode('{test: 2, test: x}')).toBe('e3Rlc3Q6IDIsIHRlc3Q6IHh9')
    expect(decode('e3Rlc3Q6IDIsIHRlc3Q6IHh9')).toBe('{test: 2, test: x}')

    expect(encode('[]')).toBe('W10=')
    expect(decode('W10')).toBe('[]')

    expect(encode(JSON.stringify(null))).toBe('bnVsbA==')
    expect(decode('bnVsbA==')).toBe('null')

    expect(encode(JSON.stringify(undefined))).toBe('dW5kZWZpbmVk')
    expect(decode('dW5kZWZpbmVk')).toBe('undefined')

    expect(encode(JSON.stringify(NaN))).toBe('bnVsbA==')
    expect(decode('bnVsbA==')).toBe('null')
  })
})
