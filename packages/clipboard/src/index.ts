import Clipboard from 'clipboard'

export const orgClipboard = Clipboard

export const copyToClipboard = (
  text: string,
  successTips?: string,
  Message?: any
) => {
  const button = document.createElement('button')
  button.className = 'copy'

  document.getElementsByTagName('body')[0].appendChild(button)

  const clipboard = new Clipboard('.copy', {
    text() {
      return text
    }
  })

  clipboard.on('success', () => {
    if (successTips && Message) {
      Message.success(successTips)
    }
    button.remove()
    clipboard.destroy()
  })

  button.click()
}

export const copyLink = (
  successTips = '已经成功复制到当前网址，请重启浏览器',
  Message?: any
) => copyToClipboard(location.href, successTips, Message)
