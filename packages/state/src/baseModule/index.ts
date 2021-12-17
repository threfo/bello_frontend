export interface Command {
  type: string
  value: any
}

export interface BindAlertProps {
  jsonCompValue?: any
}

export interface BaseModuleState {
  stateCommand: null | Command // 用来触发 组件的command
  bindDialogProps: any // 可以通过这个state 控制在 MainLayout 的dailog 快速动态构建 dailog
  bindDrawerProps: any // 可以通过这个state 控制在 MainLayout 的drawer 快速动态构建 drawer
  bindAlertProps: null | BindAlertProps //  可以通过这个state 控制在 MainLayout 的alert 快速动态构建 的alert
}

const initState = (): BaseModuleState => ({
  stateCommand: null,
  bindDialogProps: null,
  bindDrawerProps: null,
  bindAlertProps: null
})

export const initBaseModule = () => ({
  namespaced: true,
  state: initState(),
  mutations: {
    setCommand(state: BaseModuleState, command: Command): void {
      state.stateCommand = command
    },
    setBindDialogProps(state: BaseModuleState, bindDialogProps: any): void {
      state.bindDialogProps = bindDialogProps
    },
    setBindDrawerProps(state: BaseModuleState, bindDrawerProps: any): void {
      state.bindDrawerProps = bindDrawerProps
    },
    setBindAlertProps(state: BaseModuleState, bindAlertProps: any): void {
      state.bindAlertProps = bindAlertProps
    }
  },
  actions: {}
})

export default initBaseModule
