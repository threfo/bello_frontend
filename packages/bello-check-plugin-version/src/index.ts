import http from './http'

interface PluginInfo {
  xclientId: string
  version: string
  token: string
}

interface Version {
  latest: string // 最新版本
  least: string // 最低版本
}

interface Config {
  [key: string]: any
  assets: {
    [key: string]: any
    version: string
  }
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

export default class xiaobeiVersion {
  hasPlugin = false
  pluginInfo: PluginInfo | null = null
  version: Version | null = null
  constructor(config: Config) {
    this.fetchVersionConfig(config).then(res => {
      this.version = res
    })
    window.addEventListener('message', this.fetchXClientVersion)
  }
  async fetchVersionConfig(config: Config): Promise<Version> {
    const versionApi = config?.assets?.version || ''

    let version: Version = {
      latest: '',
      least: ''
    }

    if (!versionApi) {
      return version
    }

    const versionRes = await http(versionApi, 'get')
    // 兼容配置信息。根据api接口内容来判断
    if (versionApi.includes('client_parse_v2')) {
      version = versionRes?.version || {}
    } else if (versionApi.includes('version')) {
      version = versionRes
    } else {
      version = {
        latest: versionRes?.config_data?.version || '',
        least: versionRes?.config_data?.leastVersion || ''
      }
    }

    return version
  }
  fetchXClientVersion = (event): void => {
    const { data } = event || {}
    const { data: pluginData, type } = data || {}
    if (type === 'bl_plugin_inited') {
      this.hasPlugin = true
      this.pluginInfo = pluginData
    }
  }
  checkVersion(): string {
    if (!this.hasPlugin) {
      // 未安装插件
      return 'uninstall'
    }

    const { version = '' } = this.pluginInfo || {}
    const { latest = '', least = '' } = this.version || {}

    const isLeastVersion = judgeVersionUpdated(version, least)
    if (isLeastVersion) {
      // 强制更新
      return 'least'
    }

    const isLatestVersion = judgeVersionUpdated(version, latest)
    if (isLatestVersion) {
      // 软更新
      return 'latest'
    }

    // 安装了最新版
    return 'success'
  }
  destroy(): void {
    window.removeEventListener('message', this.fetchXClientVersion)
  }
}
