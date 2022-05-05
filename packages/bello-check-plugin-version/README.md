# 检查 bello 插件版本弹出框

> 内置了 XiaobeiVersion 工具，提供了基础弹出框的方法 CreateDialog、judgeVersionUpdated，如有定制需要，请引用 CreateDialog 并继承，自己重写 getContentDom 方法即可

基础使用方式

```typescript
import XiaobeiVersion from '@belloai/check-plugin-version'

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
        'https://assets.belloai.com/staging/config/login_logo.png', // 显示在弹框内的url
      update_title: '', // 显示在弹框内的标题
      theme_color: 'black', // 弹框主题色
      features: ['吃饭', '睡觉', '打豆豆'] // 弹框内的提示文案
    }
  }
)
```
