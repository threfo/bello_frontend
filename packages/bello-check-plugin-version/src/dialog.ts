export interface DialogConfig {
  width?: number
  visible?: boolean
  showClose?: boolean
  closeOnClickModal?: boolean
  content?: HTMLElement
  status?: 'update' | 'uninstall'
  [key: string]: any
}

interface DomMap {
  dialog: HTMLDivElement
  modal: HTMLDivElement
  content: HTMLDivElement
  close: HTMLSpanElement
}

interface Attributes {
  [key: string]: any
}

export interface UpdateConfig {
  notice_timing?: string
  extension?: {
    download_page: string
    [key: string]: string
  }
  web?: {
    login_logo_uri: string
    update_title: string
    features: Array<string>
    theme_color: string
    button_color: string
    feature_title: string
    [key: string]: string | Array<string>
  }
}

export interface BaseConfig extends DialogConfig, UpdateConfig {}

export const handleChangeConfig: Attributes = {
  id(value: string, domMap: DomMap) {
    const { dialog } = domMap
    dialog.setAttribute('id', value)
  },
  width(value: number, domMap: DomMap): void {
    const { content } = domMap
    content.style.width = `${value}px`
  },
  visible(value: boolean, domMap: DomMap): void {
    const { dialog, content } = domMap

    if (value) {
      dialog.style.display = 'block'
      setTimeout(() => {
        content.style.marginTop = '15vh'
      })
    } else {
      content.style.marginTop = '0'
      setTimeout(() => {
        dialog.style.display = 'none'
      }, 100)
    }
  },
  showClose(value: boolean, domMap: DomMap): void {
    const { content, close } = domMap

    if (value) {
      content.appendChild(close)
    } else {
      content.removeChild(close)
    }
  },
  closeOnClickModal(value: boolean, domMap: DomMap): void {
    const { modal } = domMap
    if (value) {
      modal.style.pointerEvents = 'auto'
    } else {
      modal.style.pointerEvents = 'none'
    }
  }
}

export const setDomAttrs = (dom: HTMLElement, attrs: Attributes): void => {
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'style') {
      Object.entries(value).forEach(([styleName, styleValue]) => {
        dom.style[styleName] = styleValue
      })
    } else {
      dom.setAttribute(key, value)
    }
  })
}

export class CreateDialog {
  public config: BaseConfig
  public status = '更新'
  private domMap: DomMap
  constructor(config: DialogConfig) {
    const { content = document.body, visible, status } = config || {}
    const domMap = {
      dialog: document.createElement('div'),
      modal: document.createElement('div'),
      content: document.createElement('div'),
      close: document.createElement('span')
    }
    domMap.dialog.style.display = visible ? 'block' : 'none'
    content?.appendChild(domMap.dialog)
    this.status = status === 'uninstall' ? '安装' : '更新'

    const _config: DialogConfig = {}
    this.domMap = domMap
    this.config = new Proxy(_config, {
      set(obj, prop: string, value) {
        obj[prop] = value
        const _configHandle: (arg0: string, arg1: DomMap) => void | null =
          handleChangeConfig[prop]
        _configHandle && _configHandle(value, domMap)
        return true
      }
    })

    this.setConfig({
      width: 468,
      visible: false,
      showClose: true,
      ...config
    })
    this.onCreate()
  }
  onCreate(): void {
    const { dialog, modal, content, close } = this.domMap
    setDomAttrs(dialog, {
      style: {
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'auto',
        margin: 0,
        zIndex: 999999
      }
    })
    setDomAttrs(modal, {
      style: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: '0.5',
        background: '#000000'
      }
    })
    setDomAttrs(content, {
      style: {
        transition: '0.2s',
        position: 'relative',
        fontWeight: 400,
        marginTop: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '50px',
        padding: '24px',
        background: '#fff',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgb(0 0 0 / 30%)',
        boxSizing: 'border-box'
      }
    })

    setDomAttrs(close, {
      style: {
        position: 'absolute',
        right: '16px',
        top: '16px',
        fontSize: '14px',
        cursor: 'pointer',
        color: 'gray'
      }
    })

    close.addEventListener('click', this.onClose.bind(this))
    close.innerHTML = `
      <svg t="1651782854325" class="icon"
        style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11809"
      >
        <path d="M838.826667 185.173333a47.786667 47.786667 0 0 0-68.266667 0L512 443.733333 253.44 185.173333a48.213333 48.213333 0 0 0-68.266667 68.266667L443.733333 512l-258.56 258.56a47.786667 47.786667 0 0 0 0 68.266667 42.666667 42.666667 0 0 0 34.133334 14.506666 42.666667 42.666667 0 0 0 34.133333-14.506666L512 580.266667l258.56 258.56a47.36 47.36 0 0 0 68.266667 0 47.786667 47.786667 0 0 0 0-68.266667L580.266667 512l258.56-258.56a47.786667 47.786667 0 0 0 0-68.266667z" p-id="11810" data-spm-anchor-id="a313x.7781069.0.i0"></path>
      </svg>`
    modal.addEventListener('click', this.onClose.bind(this))

    const contentChild = this.getContentDom()
    contentChild.forEach(el => {
      content.appendChild(el)
    })

    dialog.appendChild(modal)
    dialog.appendChild(content)
  }
  setConfig(config: DialogConfig): DialogConfig {
    Object.entries(config).forEach(([key, value]) => {
      this.config[key] = value
    })

    return this.config
  }
  getContentDom(): HTMLElement[] {
    const Logo = document.createElement('img')
    const Title = document.createElement('div')
    const Features = document.createElement('ul')
    const UpdateBtn = document.createElement('div')

    const { extension, web } = this.config || {}
    const { download_page = 'https://www.belloai.com/download' } =
      extension || {}
    const {
      login_logo_uri = 'https://assets.belloai.com/staging/config/login_logo.png',
      update_title = '安装插件，即刻开启AI招聘功能，实现降本增效',
      features = [],
      feature_title = '安装后可享用',
      theme_color = '#5a66ff',
      button_color = '#5a66ff'
    } = web || {}

    Logo.src = login_logo_uri
    Logo.height = 30

    Title.innerHTML = `
      <p style="
        line-height: 1.375rem;
        font-size: 1rem;
        margin: 4px 0;
        color: rgba(40,40,60,1);">${update_title}</p>
    `
    setDomAttrs(Features, {
      style: {
        listStyle: 'none',
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap'
      }
    })

    if (features.length) {
      const append = document.createElement('p')
      setDomAttrs(append, {
        style: {
          lineHeight: '1.375rem',
          fontSize: '.875rem',
          marginTop: '2.5rem',
          marginBottom: '1rem',
          color: 'rgba(72,72,89,1)'
        }
      })
      append.innerText = feature_title
      Title.appendChild(append)
    }

    Array.from(features || []).forEach(item => {
      const itemDom = document.createElement('li')
      setDomAttrs(itemDom, {
        style: {
          width: '33.333333%',
          marginBottom: '0.75rem',
          fontSize: '.75rem',
          color: 'rgba(115,115,128,1)'
        }
      })
      itemDom.innerHTML = `
        <i style="display: inline-block;
        width: 4px;
        height: 4px;
        margin-right: 4px;
        vertical-align: 2px;
        background-color: ${theme_color || '#4a57ff'} ;
        border-radius: 50%;"></i>
        ${item}
      `
      Features.appendChild(itemDom)
    })

    setDomAttrs(UpdateBtn, {
      style: {
        marginTop: '2.5rem',
        textAlign: 'center'
      }
    })
    UpdateBtn.innerHTML = `
      <a
        style="color: white; line-height: 1.375rem;
        font-weight: 500; font-size: .875rem; border-radius: 0.25rem;
        padding-top: 0.5rem; padding-left: 5rem; padding-right: 5rem; padding-bottom: 0.5rem;
        background-color: ${
          button_color || 'rgba(90,102,255)'
        }; cursor: pointer; text-decoration: none;"
        href="${download_page}" target="_blank">立即${this.status}</a>
    `

    return [Logo, Title, Features, UpdateBtn]
  }
  onClose(): void {
    this.config.visible = false
  }
  onOpen(): void {
    this.config.visible = true
  }
  getDialog(): DomMap {
    return this.domMap
  }
  setContent(contentDom: HTMLElement): void {
    const { content } = this.domMap
    const newContent = document.createElement('div')
    newContent.appendChild(contentDom)
    content.appendChild(newContent)
  }
  destroy(): void {
    const { close, modal } = this.domMap
    close.removeEventListener('click', this.onClose.bind(this))
    modal.removeEventListener('click', this.onClose.bind(this))
    this.config = {}
  }
}
