import { CreateDialog, BaseConfig } from './dialog'

export { CreateDialog }

interface PluginInfo {
  xclientId: string
  version: string
  token: string
}

interface Version {
  latest: string // 最新版本
  least: string // 最低版本
}

export function judgeVersionUpdated(
  currentVersion: string,
  newestVersion: string
): boolean {
  if (!currentVersion || !newestVersion) return false
  const currentVersionArr = currentVersion
    .split('.')
    .map(each => parseInt(each))
  const newestVersionArr = newestVersion.split('.').map(each => parseInt(each))
  if (newestVersionArr[0] > currentVersionArr[0]) {
    // 大版本
    return true
  }
  if (newestVersionArr[0] === currentVersionArr[0]) {
    // 大版本一样
    if (newestVersionArr[1] > currentVersionArr[1]) {
      // 小版本
      return true
    }
    if (newestVersionArr[1] === currentVersionArr[1]) {
      // 小版本一样
      if (newestVersionArr[2] > currentVersionArr[2]) {
        return true
      }
    }
  }
  return false
}

export default class XiaobeiVersion {
  hasPlugin = false
  dialog: CreateDialog | null
  pluginInfo: PluginInfo | null = null
  version: Version | null = null
  constructor(
    version: Version,
    config?: BaseConfig,
    public content?: HTMLElement
  ) {
    this.version = version
    this.content?.querySelector('#_xiaobei_update_dialog_')?.remove()

    this.dialog = new CreateDialog({
      visible: false,
      showClose: true,
      closeOnClickModal: false,
      id: '_xiaobei_update_dialog_',
      content,
      ...(config || {})
    })

    const messageToPlugin = setInterval(() => {
      if (this.hasPlugin) {
        clearInterval(messageToPlugin)
        return
      }
      window.postMessage({ type: 'osr_inited' }, '*')
    }, 200)

    window.addEventListener('message', this.fetchXClientVersion)

    setTimeout(() => {
      if (!this.hasPlugin) {
        clearInterval(messageToPlugin)
        this.checkVersion()
        window.removeEventListener('message', this.fetchXClientVersion)
      }
    }, 3000)
  }
  fetchXClientVersion = (event: MessageEvent): void => {
    const { data } = event || {}
    const { data: pluginData, type } = data || {}
    if (type === 'bl_plugin_inited') {
      this.hasPlugin = true
      this.pluginInfo = pluginData
      this.checkVersion()
    }
  }
  checkVersion(): string {
    if (!this.dialog) {
      return 'no_dialog'
    }
    if (!this.hasPlugin) {
      this.dialog.setConfig({
        visible: true,
        showClose: false,
        status: 'uninstall'
      })
      // 未安装插件
      return 'uninstall'
    }

    const { version = '' } = this.pluginInfo || {}
    const { latest = '', least = '' } = this.version || {}

    const isLeastVersion = judgeVersionUpdated(version, least)

    if (isLeastVersion) {
      // 强制更新
      this.dialog.setConfig({ visible: true, showClose: false })
      return 'least'
    }

    const isLatestVersion = judgeVersionUpdated(version, latest)

    if (isLatestVersion) {
      // 软更新
      this.dialog.setConfig({ visible: true, showClose: true })
      return 'latest'
    }

    // 安装了最新版
    return 'success'
  }
  destroy(): void {
    this.version = null
    window.removeEventListener('message', this.fetchXClientVersion)
  }
}
