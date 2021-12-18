/**
 * 缓存一些组件的 Offset 指，一般是 height，方便于跨组件高度计算
 *
 */

export interface Offset {
  width?: number
  height?: number
  ref?: any
}
export interface OffsetMap {
  [key: string]: Offset
}
export interface ScrollStatusMap {
  [key: string]: string
}

export interface OffsetModuleState {
  offsetMap: OffsetMap
  scrollStatusMap: ScrollStatusMap
}

const initState = (): OffsetModuleState => ({
  offsetMap: {},
  scrollStatusMap: {}
})

export const initOffsetModule = ({ Vue }) => ({
  namespaced: true,
  state: initState(),
  getters: {
    appMain(state: OffsetModuleState): number {
      const { navBar } = state.offsetMap || {}
      const { height = 0 } = navBar || {}
      return document.body.clientHeight - height
    }
  },
  mutations: {
    setOffset(state: OffsetModuleState, { key, offset }: any): void {
      // console.log('setOffset', key, offset)
      Vue.set(state.offsetMap, key, offset)
    },
    delOffset(state: OffsetModuleState, key: string): void {
      Vue.delete(state.offsetMap, key)
    },
    setScrollStatus(
      state: OffsetModuleState,
      { key, scrollStatus }: any
    ): void {
      if (state.scrollStatusMap[key] !== scrollStatus) {
        Vue.set(state.scrollStatusMap, key, scrollStatus)
      }
    }
  },
  actions: {
    watchOffset({ commit }, props: any): Offset {
      const { key } = props || {}

      const ref = document.getElementById(key)
      const { offsetHeight: height = 0, offsetWidth: width = 0 } = ref || {}
      // console.log('watchOffset', key, height, ref)

      const offset = {
        width,
        height
      }
      commit('setOffset', {
        key,
        offset
      })
      return offset
    },
    fetchOffset({ commit, state }): void {
      // 该方法在 main.ts 内通过window.onresize 的监听执行，看被缓存的 key内的 ref值和旧的是否有变化进行更新
      const { offsetMap } = state

      Object.keys(offsetMap).forEach(key => {
        const item = offsetMap[key] || {}
        const { height, width } = item
        const ref = document.getElementById(key)
        if (ref) {
          const { offsetHeight, offsetWidth } = ref
          // console.log('fetchOffset', key, offsetHeight, height, ref)
          const newItem: Offset = {}
          if (offsetHeight !== height) {
            newItem.height = offsetHeight
          }
          if (offsetWidth !== width) {
            newItem.width = offsetWidth
          }
          if (Object.keys(newItem).length > 0) {
            commit('setOffset', {
              key,
              offset: {
                ...item,
                ...newItem
              }
            })
          }
        }
      })
    }
  }
})

// 存储的内容 用到的才加
export default initOffsetModule
