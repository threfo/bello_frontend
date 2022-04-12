import { timerHelper } from '../src'
describe('timerHelper', () => {
  it('timerHelper test', async () => {
    const test = { a: 1 }

    expect(timerHelper.timer['a']).toBeUndefined()

    timerHelper.setTimeout(
      () => {
        test.a = 2
      },
      1000,
      'a'
    )
    expect(test.a).toBe(1)
    expect(timerHelper.timer['a']).toBeDefined()

    timerHelper.setTimeout(
      () => {
        test.a = 3
      },
      1000,
      'a'
    )

    expect(test.a).toBe(1)
    expect(timerHelper.timer['a']).toBeDefined()

    const sleep = time => {
      return new Promise(r => {
        setTimeout(() => {
          r(1)
        }, time)
      })
    }

    await sleep(1001)

    expect(test.a).toBe(3)
    expect(timerHelper.timer['a']).toBeDefined()
  })
})
