import { getOwnProtoType } from '../utils'

describe('utils', () => {
  it('getOwnProtoType', () => {
    expect(getOwnProtoType({}, 'Object')).toBe(true)

    expect(getOwnProtoType('', 'String')).toBe(true)

    expect(getOwnProtoType([], 'Object')).toBe(false)
  })
})
