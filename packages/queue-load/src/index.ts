interface GetDataProps {
  postData: any
  passLoading?: boolean
}

type loadDataFunc = (props: GetDataProps) => Promise<any>
type checkInQueueFunc = (queue: GetDataProps[], postData: any) => boolean

interface QueueLoaderProps {
  key: string
  loadDataFunc: loadDataFunc
  checkInQueueFunc?: checkInQueueFunc
}

class QueueLoader {
  queue: GetDataProps[]
  loadDataFunc: loadDataFunc

  loading = false

  constructor(props: any) {
    const { loadDataFunc, checkInQueueFunc } = props
    this.queue = []
    this.loadDataFunc = loadDataFunc
    if (checkInQueueFunc) {
      this.checkInQueueFunc = checkInQueueFunc
    }
  }

  checkInQueueFunc(queue: GetDataProps[], checkData: any) {
    return queue
      .map(({ postData }) => JSON.stringify(postData))
      .includes(JSON.stringify(checkData))
  }

  async getData(props: GetDataProps) {
    const { postData, passLoading = false } = props

    const { loadDataFunc, checkInQueueFunc } = this
    if (!loadDataFunc) {
      throw new Error('loadDataFunc 未定义')
    }
    if (!checkInQueueFunc) {
      throw new Error('checkInQueueFunc 未定义')
    }

    let returnData

    if (passLoading) {
      returnData = await loadDataFunc(props)
    } else {
      if (!checkInQueueFunc(this.queue, postData)) {
        this.queue.push(props)
      }

      if (!this.loading) {
        await this.nextLoadData()
      }
    }
    return returnData
  }

  async nextLoadData() {
    this.loading = true

    const props = this.queue.shift()
    if (props) {
      const { loadDataFunc } = this
      await loadDataFunc(props)
      await this.nextLoadData()
    }

    this.loading = false
  }
}

export const queueLoaderFactory = {
  getQueueLoader(props: QueueLoaderProps) {
    const { key } = props
    if (!this[key]) {
      this[key] = new QueueLoader(props)
    }
    return this[key]
  }
}
