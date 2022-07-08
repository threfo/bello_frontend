import { checkSchollData, mockSchollData } from '../mock'
import { getEventDate, transformEnhance } from '../enhance'

describe('src/utils/common/transformEnhance.ts', () => {
  it('transformEnhance', () => {
    const test1 = transformEnhance(mockSchollData, '锦州渤海大学', 'nixt')
    // TODO 补充其他的case
    expect(JSON.stringify(test1)).toBe(JSON.stringify(checkSchollData))
  })

  it('getEventDate', () => {
    expect(
      getEventDate({
        event_date: '2019',
        year: 2019
      })
    ).toBe('2019')

    expect(
      getEventDate({
        event_date: '2019-10',
        year: 2019
      })
    ).toBe('2019/10')

    expect(
      getEventDate({
        year: 2019
      })
    ).toBe('2019')

    expect(getEventDate(null)).toBe('')
  })
})
