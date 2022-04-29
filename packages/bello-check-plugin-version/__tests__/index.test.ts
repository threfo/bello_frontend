import { judgeVersionUpdated } from '../src'

describe('判断版本号', () => {
  it('judgeVersionUpdated', () => {
    expect(judgeVersionUpdated('1.0.0', '1.0.1')).toBe(true)
    expect(judgeVersionUpdated('1.0.0', '1.0.0')).toBe(false)
  })
})
