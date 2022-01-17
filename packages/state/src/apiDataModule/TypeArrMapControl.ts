interface IdsQueueMap {
  [entryKey: string]: string[]
}
export default class TypeArrMapControl {
  idsQueueMap: IdsQueueMap
  constructor() {
    this.idsQueueMap = {}
  }

  pushInQueue({
    entryKey,
    dataId
  }: {
    entryKey: string
    dataId: string
  }): void {
    const arr = this.getArr(entryKey)
    if (!arr.includes(dataId)) {
      arr.push(dataId)
    }
    this.setArr(entryKey, arr)
  }

  popInQueue({ entryKey, dataId }: { entryKey: string; dataId: string }): void {
    const arr = this.getArr(entryKey)
    this.setArr(
      entryKey,
      arr.filter(id => id !== dataId)
    )
  }

  getArr(entryKey: string): string[] {
    return this.idsQueueMap[entryKey] || []
  }

  setArr(entryKey: string, arr: string[]): void {
    this.idsQueueMap[entryKey] = arr
  }
}
