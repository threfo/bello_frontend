import { checkVariableType } from '../utils/check'

describe('check', () => {
  it('checkVariableType', () => {
    expect(checkVariableType({}, 'Object')).toBe(true)
    expect(checkVariableType(0, 'Number')).toBe(true)
    expect(checkVariableType('', 'String')).toBe(true)
    expect(checkVariableType([], 'Array')).toBe(true)
    expect(checkVariableType(null, 'Null')).toBe(true)
    expect(checkVariableType(undefined, 'Undefined')).toBe(true)
    expect(checkVariableType(NaN, 'Number')).toBe(true)
    expect(checkVariableType(BigInt(2), 'BigInt')).toBe(true)
    expect(checkVariableType(Symbol(2), 'Symbol')).toBe(true)
    expect(checkVariableType(new Text('23'), 'Text')).toBe(true)
    expect(
      checkVariableType(document.createElement('div'), 'HTMLDivElement')
    ).toBe(true)

    expect(checkVariableType(new Float64Array(23), 'Float64Array')).toBe(true)

    expect(checkVariableType(new Text('23'), ['Text', 'String'])).toBe(true)
  })
})
