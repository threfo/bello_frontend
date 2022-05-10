import { Attributes, JsonElement, JsonElementEvents } from './interface'
import { getOwnProtoType } from './utils'

export const json2Attrs = (
  dom: HTMLElement,
  attrs: Attributes
): HTMLElement => {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value ?? null === null) {
      return
    }
    if (getOwnProtoType(value, 'String')) {
      dom.setAttribute(key, value)
      return
    }

    if (key !== 'style') {
      dom.setAttribute(key, JSON.stringify(value))
      return
    }

    Object.entries(value).forEach(([styleName, styleValue]) => {
      dom.style[styleName] = styleValue
    })
  })

  return dom
}

export const bindJsonElementEvents = (
  dom: HTMLElement | Element,
  events: JsonElementEvents
): void => {
  Object.entries(events).forEach(([key, event]) => {
    dom.addEventListener(key, event)
  })
}

export const removeJsonElementEvents = (
  dom: HTMLElement | Element,
  events: JsonElementEvents
): void => {
  Object.entries(events).forEach(([key, event]) => {
    dom.removeEventListener(key, event)
  })
}

export const createElement = (element: JsonElement): HTMLElement | Text => {
  const { tag, innerText, innerHTML } = element
  const tagName = (tag ?? 'text').toLowerCase()
  if (tagName === 'text') {
    return new Text(innerText ?? innerHTML ?? '')
  }

  const creteDom = document.createElement(tagName)
  if (innerHTML) {
    creteDom.innerHTML = innerHTML
  }
  if (innerText) {
    creteDom.innerText = innerText
  }

  return creteDom
}
