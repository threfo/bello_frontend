/**
 * 滚动到页面顶部
 */
export function scrollToTop(id = 'appMain') {
  const el = document.getElementById(id) as HTMLBaseElement
  if (el) {
    el.scrollTop = 0
  } else {
    console.warn(`scrollToTop id: ${id} not find`)
  }
}

export function scrollIntoView(id = 'appMain') {
  const el = document.getElementById(id) as HTMLBaseElement
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    console.warn(`scrollIntoView id: ${id} not find`)
  }
}

export const getScrollStatus = event => {
  const { scrollTop, scrollHeight, clientHeight, id: key } = event.target || {}

  let scrollStatus = 'mid'
  if (scrollTop < 100) {
    scrollStatus = 'top'
  } else if (clientHeight + scrollTop + 100 > scrollHeight) {
    scrollStatus = 'bottom'
  }

  return { key, scrollStatus }
}

// 该方法的调用建议是 ID 在那一个组件，就在那个组件的文件内的mounted调用
export const setScrollListener = (domId, scrollListenerFunc) => {
  const dom = document.getElementById(domId)
  if (dom) {
    dom.removeEventListener('scroll', scrollListenerFunc)
    dom.addEventListener('scroll', scrollListenerFunc)
  } else {
    console.error('setScrollListener domId no find', domId)
  }
}
// 该方法的调用建议是 ID 在那一个组件，就在那个组件的文件内的beforeDestroy调用
export const removeScrollListener = (domId, scrollListenerFunc) => {
  const dom = document.getElementById(domId)
  if (dom) {
    dom.removeEventListener('scroll', scrollListenerFunc)
  } else {
    console.error('removeScrollListener domId no find', domId)
  }
}

export const initScrollListenerMixin = ({
  mapState,
  mapMutations,
  listenerScrollDomId,
  offsetModuleName = 'offsetModule'
}) => {
  return {
    computed: {
      ...mapState(offsetModuleName, ['scrollStatusMap']),
      scrollStatus({ scrollStatusMap }) {
        return scrollStatusMap[listenerScrollDomId] || 'top'
      }
    },
    mounted() {
      setScrollListener(listenerScrollDomId, this.scrollStatusListenerFunc)
    },
    beforeDestroy() {
      removeScrollListener(listenerScrollDomId, this.scrollStatusListenerFunc)
    },
    methods: {
      ...mapMutations(offsetModuleName, ['setScrollStatus']),
      scrollStatusListenerFunc(event) {
        const { key, scrollStatus } = getScrollStatus(event)

        if (key && !!this.setScrollStatus) {
          this.setScrollStatus({ key, scrollStatus })
        }
      }
    }
  } as any
}
