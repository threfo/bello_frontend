import { invoke } from 'lodash'

class InitContext {
  contextWindow
  needInitWindowLister: any[] = []
  windowListerLog = {}

  constructor(
    props: { needInitWindowLister?: any[]; contextWindow: any },
    otherThing?: () => void
  ) {
    const { needInitWindowLister, contextWindow } = props || {}

    if (needInitWindowLister) {
      this.needInitWindowLister = needInitWindowLister
    }

    if (contextWindow) {
      this.contextWindow = contextWindow
    }
    this.initWindowLister()

    if (otherThing) {
      otherThing()
    }
  }

  initWindowLister() {
    // console.log(
    //   this.contextWindow,
    //   'initWindowLister',
    //   this.needInitWindowLister
    // )
    this.needInitWindowLister.forEach(item => {
      const [path, args] = item
      try {
        // console.log('initWindowLister', path, args)
        invoke(this.contextWindow, `${path}.removeListener`, args[0])
        invoke(this.contextWindow, `${path}.addListener`, ...args)

        this.logWindowLister(path)
      } catch (error) {
        console.error('initWindowLister', path, error)
      }
    })
  }

  removeWindowListener() {
    this.needInitWindowLister.forEach(item => {
      const [path, args] = item
      try {
        invoke(this.contextWindow, `${path}.removeListener`, args[0])

        this.logWindowLister(path, 'remove')
      } catch (error) {
        console.error('initWindowLister', path, error)
      }
    })
  }

  logWindowLister(path, model = 'add') {
    const { logs = [] } = this.windowListerLog[path] || {}

    const now = new Date()
    this.windowListerLog[path] = {
      lastTime: now,
      logs: [...logs, `${model} at ${now}`]
    }
  }
}

export default {
  allContext: {},
  initContext(
    props: { needInitWindowLister?: any[]; contextWindow: any },
    otherThing?: () => void
  ): InitContext {
    const context = new InitContext(props, otherThing)
    const { contextWindow } = context
    const { logs = [] } = this.allContext[contextWindow] || {}
    this.allContext[contextWindow] = [
      ...logs,
      {
        context,
        created: new Date()
      }
    ]

    return context
  }
}
