import { JsonHtml, JsonElement, JsonElementEvents } from './interface'

import {
  json2Attrs,
  createElement,
  bindJsonElementEvents,
  removeJsonElementEvents
} from './dom'

export default class CreateJsonElement {
  root: HTMLElement
  eventHashMap: Map<symbol, JsonElementEvents>
  constructor(jsonHtml: JsonHtml) {
    const { root, children } = jsonHtml || {}
    this.eventHashMap = new Map()
    let rootEl = document.querySelector(root) as HTMLElement
    if (!rootEl) {
      rootEl = document.body
    }

    // TODO watch jsonHTML and find Nodes to Change

    this.bindAttrsAndEvents(rootEl, jsonHtml)
    this.appendChildren(rootEl, children)
    this.root = rootEl
  }
  bindAttrsAndEvents(dom: HTMLElement, config: JsonElement | JsonHtml): void {
    const { attrs, events } = config
    dom._hash_id_ = Symbol(dom.nodeType)
    if (attrs) {
      json2Attrs(dom, attrs)
    }
    if (events) {
      bindJsonElementEvents(dom, events)
    }
  }
  appendChildren(
    root: HTMLElement | string,
    children: JsonElement[] | JsonElement | undefined
  ): void {
    if (!children) {
      return
    }
    let rootDom: HTMLElement | null

    if (root instanceof HTMLElement) {
      rootDom = root
    } else {
      rootDom = document.querySelector(root)
    }

    if (!rootDom) {
      throw new Error(`can't find this class select dom ${root}`)
    }

    const deepPatch = (el: HTMLElement, jsonEl: JsonElement) => {
      const dom = createElement(jsonEl)
      if (dom instanceof HTMLElement) {
        this.bindAttrsAndEvents(dom, jsonEl)
      }
      el.appendChild(dom)
      if (jsonEl?.children && dom instanceof HTMLElement) {
        this.appendChildren(dom, jsonEl?.children)
      }
    }

    if (!Array.isArray(children)) {
      deepPatch(rootDom, children)
      return
    }

    for (const jsonEl of children) {
      deepPatch(rootDom, jsonEl)
    }
  }
  destroy(): void {
    const doms = this.root.querySelectorAll('*')
    doms.forEach(el => {
      const eventHash = el?._hash_id_
      if (!eventHash) {
        return
      }
      const handle = this.eventHashMap.get(eventHash)
      if (!handle) {
        return
      }

      removeJsonElementEvents(el, handle)
    })

    this.eventHashMap.clear()
  }
}
