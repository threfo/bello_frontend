import TypeArrMapControl from '../../src/apiDataModule/TypeArrMapControl'

describe('packages/state/src/apiDataModule/TypeArrMapControl.ts', () => {
  it('TypeArrMapControl', () => {
    const test = new TypeArrMapControl()

    expect(JSON.stringify(test.idsQueueMap)).toBe(JSON.stringify({}))

    test.pushInQueue({ entryKey: 'entryKey1', dataId: 'dataId1' })
    test.pushInQueue({ entryKey: 'entryKey1', dataId: 'dataId1' })
    test.pushInQueue({ entryKey: 'entryKey1', dataId: 'dataId2' })
    test.pushInQueue({ entryKey: 'entryKey2', dataId: 'dataId1' })
    test.pushInQueue({ entryKey: 'entryKey2', dataId: 'dataId3' })
    expect(JSON.stringify(test.idsQueueMap)).toBe(
      JSON.stringify({
        entryKey1: ['dataId1', 'dataId2'],
        entryKey2: ['dataId1', 'dataId3']
      })
    )
    expect(JSON.stringify(test.getArr('entryKey1'))).toBe(
      JSON.stringify(['dataId1', 'dataId2'])
    )

    test.popInQueue({ entryKey: 'entryKey1', dataId: 'dataId1' })
    expect(JSON.stringify(test.idsQueueMap)).toBe(
      JSON.stringify({
        entryKey1: ['dataId2'],
        entryKey2: ['dataId1', 'dataId3']
      })
    )

    test.setArr('entryKey1', ['dataId1', 'dataId3'])
    expect(JSON.stringify(test.idsQueueMap)).toBe(
      JSON.stringify({
        entryKey1: ['dataId1', 'dataId3'],
        entryKey2: ['dataId1', 'dataId3']
      })
    )
  })
})
