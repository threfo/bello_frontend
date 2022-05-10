# 检查 bello 插件版本弹出框

> 内置了 XiaobeiVersion 工具，提供了基础弹出框的方法 CreateDialog、judgeVersionUpdated，如有定制需要，请引用 CreateDialog 并继承，自己重写 getContentDom 方法即可

## 基础使用方式

```typescript
import XiaobeiVersion from '@belloai/check-plugin-version'

// XiaobeiVersion(arg0: versionConfig, arg1: Config[可配置内容见 Config 参数], arg2: 注入的元素dom  )

new XiaobeiVersion(
  {
    latest: '5.0.520',
    least: '5.0.206'
  },
  {
    extension: {
      download_page: '' //插件下载页地址
    },
    web: {
      login_logo_uri:
        'https://assets.belloai.com/staging/config/login_logo.png', // 显示在弹框内的logo 的 url
      update_title: '安装插件，即刻开启AI招聘功能，实现降本增效', // 显示在弹框内的升级标题信息
      theme_color: 'black', // 弹框主题色
      features: ['吃饭', '睡觉', '打豆豆'] // 弹框内的提示文案
    }
  },
  this.$refs.xxx || document.body
)
```

### config 参数

有值信息的为默认值

```typescript
interface Config {
  // UI部分
  width: number = 468
  visible: boolean = true
  showClose: boolean = true // 是否显示弹框的关闭按钮
  closeOnClickModal: boolean = false // 点击遮罩层是否可以关闭弹框
  content: HTMLElement = document.body
  status: 'update' | 'uninstall' = 'update'

  // 信息部分
  notice_timing: string = 'unInstall,update' // unInstall 对应未安装提醒, update 对应升级提醒, 使用逗号分隔如只需要未安装功能，请传递 'unInstall'
  web: {
    login_logo_uri: string = 'https://assets.belloai.com/staging/config/login_logo.png'
    update_title: string = '安装插件，即刻开启AI招聘功能，实现降本增效'
    theme_color: string = '#5a66ff'
    features: Array<string> = []
    button_color: string = '#5a66ff'
    feature_title: string = '安装后可享用'
  }
  extension: {
    download_page: string = 'https://www.belloai.com/download'
  }
}
```

### 示例化后的方法

```typescript
interface PluginInfo {
  xclientId: string
  version: string
  token: string
}

// 'least' -> 强制更新 | 'latest' -> 软更新 | 'uninstall' -> 未安装
class XiaobeiVersion {
  hasPlugin: Boolean,
  dialog: CreateDialog,
  pluginInfo: PluginInfo | null
  version: Version | null
  status: 'least' | 'latest' | 'uninstall'
  fetchXClientVersion() {
    // 搭配 window.postMessage 使用，
    // 发送 window.postMessage({ type: 'osr_inited' }, '*')，等待插件返回 插件查询信息 { type: 'bl_plugin_inited', data: PluginInfo }
  }
  checkVersion() {
    // 检查当前版本信息 和插件做对比，如果有差异就会立刻弹出弹框
  }
  destroy() {
    // 销毁事件
  }
}
```
