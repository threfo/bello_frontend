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
  status: 'least' | 'latest' | 'uninstall' = 'uninstall'
  constructor(
    version: Version,
    config?: BaseConfig,
    public content?: HTMLElement
  ) {
    this.content = content ?? document.body

    const _config = {
      visible: false,
      showClose: true,
      closeOnClickModal: false,
      id: '_xiaobei_update_dialog_',
      notice_timing: 'unInstall,update',
      content: this.content,
      ...(config || {})
    }
    const { notice_timing, id } = _config || {}

    this.version = version
    this.content?.querySelector(`#${id}`)?.remove()

    this.dialog = new CreateDialog(_config)

    let messageToPlugin: NodeJS.Timeout

    // 检查更新
    if (notice_timing?.includes('update')) {
      messageToPlugin = setInterval(() => {
        if (this.hasPlugin) {
          clearInterval(messageToPlugin)
          return
        }
        window.postMessage({ type: 'osr_inited' }, '*')
      }, 200)

      window.addEventListener('message', this.fetchXClientVersion)
    }

    // 未安装插件
    if (notice_timing?.includes('unInstall')) {
      setTimeout(() => {
        if (!this.hasPlugin) {
          messageToPlugin && clearInterval(messageToPlugin)
          this.checkVersion()
          window.removeEventListener('message', this.fetchXClientVersion)
        }
      }, 3 * 1000)
    }
  }
  fetchXClientVersion = (event: MessageEvent): void => {
    const { data } = event || {}
    const { data: pluginData, type } = data || {}
    if (type === 'bl_plugin_inited') {
      this.hasPlugin = true
      this.pluginInfo = pluginData
      this.checkVersion()

      return data
    }
  }
  checkVersion(fn?: (arg0: XiaobeiVersion, arg1: string) => void): string {
    if (!this.dialog) {
      return 'no_dialog'
    }
    if (!this.hasPlugin) {
      this.status = 'uninstall'
      this.dialog.setConfig({
        visible: true,
        showClose: true,
        status: 'uninstall'
      })

      fn && fn(this, 'uninstall')
      // 未安装插件
      return 'uninstall'
    }

    const { version = '' } = this.pluginInfo || {}
    const { latest = '', least = '' } = this.version || {}

    const isLeastVersion = judgeVersionUpdated(version, least)

    if (isLeastVersion) {
      // 强制更新
      this.status = 'least'
      this.dialog.setConfig({ visible: true, showClose: false })
      fn && fn(this, 'least')
      return 'least'
    }

    const isLatestVersion = judgeVersionUpdated(version, latest)

    if (isLatestVersion) {
      // 软更新
      this.status = 'latest'
      this.dialog.setConfig({ visible: true, showClose: true })
      fn && fn(this, 'latest')
      return 'latest'
    }

    // 安装了最新版
    fn && fn(this, 'success')
    return 'success'
  }
  destroy(): void {
    this.version = null
    window.removeEventListener('message', this.fetchXClientVersion)
  }
}
