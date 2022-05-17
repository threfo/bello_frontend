export interface DialogConfig {
  width?: number
  visible?: boolean
  showClose?: boolean
  closeOnClickModal?: boolean
  content?: HTMLElement
  status?: string
  domSetting?: DomSetting
  [key: string]: any
}

export interface DomSetting {
  dialog?: SettingItem
  modal?: SettingItem
  close?: SettingItem
  content?: {
    logo?: SettingItem
    title?: SettingItem
    features?: SettingItem
    featuresTitle?: SettingItem
    featureItem?: SettingItem
    updateBtn?: SettingItem
  }
}

export interface SettingItem {
  style?: Attributes
  text?: string
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
    install_title: string
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

export const createElement = (tag: string, className: string): HTMLElement => {
  const dom = document.createElement(tag)
  dom.setAttribute('class', className)
  return dom
}

export const setDomSetting = (
  dom: HTMLElement,
  setting: SettingItem,
  defaultStyle?: Attributes
): void => {
  const { style = {}, text = '', ...attrs } = setting || {}

  Object.entries(attrs).forEach(([key, value]) => {
    dom.setAttribute(key, value)
  })

  Object.entries({
    ...(defaultStyle || {}),
    ...(style || {})
  }).forEach(([styleName, styleValue]) => {
    dom.style[styleName] = styleValue
  })

  dom.appendChild(new Text(text))
}

export class CreateDialog {
  public config: BaseConfig
  public domSetting: DomSetting
  private domMap: DomMap
  private status = '安装'
  constructor(config: DialogConfig) {
    const {
      content = document.body,
      visible = false,
      domSetting = {}
    } = config || {}
    this.domSetting = domSetting

    const domMap = {
      dialog: createElement('div', '_xiaobei_update_dialog_') as HTMLDivElement,
      modal: createElement(
        'div',
        '_xiaobei_update_dialog_modal_'
      ) as HTMLDivElement,
      content: createElement(
        'div',
        '_xiaobei_update_dialog_content_'
      ) as HTMLDivElement,
      close: createElement(
        'span',
        '_xiaobei_update_dialog_close_'
      ) as HTMLSpanElement
    }

    domMap.dialog.style.display = visible ? 'block' : 'none'
    content?.appendChild(domMap.dialog)

    const _config: DialogConfig = {}
    this.domMap = domMap

    this.config = new Proxy(_config, {
      set: (obj, prop: string, value) => {
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
    window.addEventListener('keyup', this.handleEsc)
  }
  onCreate(): void {
    const { dialog, modal, content, close } = this.domMap
    const {
      dialog: dialogSetting = {},
      modal: modalSetting = {},
      content: contentSetting = {},
      close: closeSetting = {}
    } = this.domSetting

    setDomSetting(dialog, dialogSetting, {
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
    })

    setDomSetting(modal, modalSetting, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: '0.5',
      background: '#000000'
    })

    setDomSetting(content, contentSetting, {
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
    })

    setDomSetting(close, closeSetting, {
      position: 'absolute',
      right: '16px',
      top: '16px',
      fontSize: '14px',
      cursor: 'pointer',
      color: 'gray',
      ...closeSetting
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
    this.status = config?.status === 'uninstall' ? '安装' : '更新'

    Object.entries(config).forEach(([key, value]) => {
      const _val = this.config[key]
      if (_val !== value) {
        this.config[key] = value
      }
    })

    this.setContent(this.getContentDom())
    return this.config
  }

  getContentDom(): HTMLElement[] {
    const Logo = createElement(
      'img',
      '_xiaobei_update_dialog_content_logo_'
    ) as HTMLImageElement
    const Title = createElement(
      'div',
      '_xiaobei_update_dialog_content_title_'
    ) as HTMLDivElement
    const Features = createElement(
      'ul',
      '_xiaobei_update_dialog_content_features_'
    ) as HTMLUListElement
    const UpdateBtnBox = createElement(
      'div',
      '_xiaobei_update_dialog_content_update-btn_'
    ) as HTMLDivElement

    const { extension, web } = this.config || {}
    const { download_page = 'https://www.belloai.com/download' } =
      extension || {}
    const {
      login_logo_uri = 'https://assets.belloai.com/staging/config/login_logo.png',
      install_title = '安装插件，即刻开启AI招聘功能，实现降本增效',
      update_title = '更新插件，即刻开启AI招聘功能，实现降本增效',
      features = [],
      feature_title = '安装后可享用',
      theme_color = '#5a66ff',
      button_color = '#5a66ff'
    } = web || {}

    Logo.src = login_logo_uri
    Logo.height = 30

    const { content: contentSetting = {} } = this.domSetting || {}
    const {
      logo: logoConfig = {},
      title: titleConfig = {
        text: this.status === '更新' ? `${update_title}` : `${install_title}`
      },
      features: featuresConfig = {},
      featuresTitle: featuresTitleConfig = { text: `${feature_title}` },
      featureItem: featureItemConfig = {},
      updateBtn: updateBtnConfig = {}
    } = contentSetting || {}

    setDomSetting(Logo, logoConfig)

    setDomSetting(Title, titleConfig, {
      lineHeight: '1.375rem',
      fontSize: '1rem',
      margin: '4px 0',
      color: 'gba(40,40,60,1);'
    })

    setDomSetting(Features, featuresConfig, {
      listStyle: 'none',
      padding: 0,
      display: 'flex',
      flexWrap: 'wrap'
    })

    if (features.length) {
      const append = createElement(
        'p',
        '_xiaobei_update_dialog_content_features_title_'
      ) as HTMLParagraphElement

      setDomSetting(append, featuresTitleConfig, {
        lineHeight: '1.375rem',
        fontSize: '.875rem',
        marginTop: '2.5rem',
        marginBottom: '1rem',
        color: 'rgba(72,72,89,1)'
      })
      Title.appendChild(append)
    }

    const len = features?.length || 0
    const featureItemWidth =
      len > 3 ? 1 / (2 + (((len + 1) >> 1) % 2)) : 1 / len

    Array.from(features || []).forEach(item => {
      const itemDom = createElement(
        'li',
        '_xiaobei_update_dialog_content_features_item_'
      ) as HTMLLIElement

      itemDom.innerHTML = `
        <i style="display: inline-block;
        width: 4px;
        height: 4px;
        margin-right: 4px;
        vertical-align: 2px;
        background-color: ${theme_color || '#4a57ff'} ;
        border-radius: 50%;"></i>
      `

      setDomSetting(
        itemDom,
        {
          text: `${item}`,
          ...featureItemConfig
        },
        {
          width: `${featureItemWidth * 100}%`,
          marginBottom: '0.75rem',
          fontSize: '.75rem',
          color: 'rgba(115,115,128,1)'
        }
      )
      Features.appendChild(itemDom)
    })

    setDomSetting(
      UpdateBtnBox,
      {},
      {
        marginTop: '2.5rem',
        textAlign: 'center'
      }
    )
    const UpdateBtn = document.createElement('a')
    setDomSetting(
      UpdateBtn,
      {
        href: download_page,
        target: '_blank',
        text: `立即${this.status}`,
        ...(updateBtnConfig || {})
      },
      {
        color: 'white',
        lineHeight: '1.375rem',
        fontWeight: 500,
        fontSize: '.875rem',
        borderRadius: '0.25rem',
        padding: '0.5rem 5rem',
        cursor: 'pointer',
        textDecoration: 'none',
        backgroundColor: button_color || 'rgba(90,102,255)'
      }
    )

    UpdateBtnBox.appendChild(UpdateBtn)

    return [Logo, Title, Features, UpdateBtnBox]
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
  setContent(contentDom: HTMLElement | HTMLElement[]): void {
    const { content, close } = this.domMap

    content.innerHTML = ''

    if (this.config.showClose) {
      content.appendChild(close)
    }

    if (Array.isArray(contentDom)) {
      contentDom.forEach(el => {
        content.appendChild(el)
      })
    } else {
      content.appendChild(contentDom)
    }
  }
  destroy(): void {
    const { close, modal } = this.domMap
    close.removeEventListener('click', this.onClose.bind(this))
    modal.removeEventListener('click', this.onClose.bind(this))
    window.removeEventListener('keyup', this.handleEsc)
    this.config = {}
  }
  handleEsc = (e): void => {
    if (e.keyCode == 27) {
      this.config.visible = false
    }
  }
}
