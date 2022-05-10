export interface Attributes {
  id?: string
  class?: string
  style?: CSSStyleDeclaration
  width?: string
  height?: string
  alt?: string
  title?: string
  type?: string
  src?: string
  href?: string
  rel?: string
}

export interface JsonElementEvents {
  click?: EventListener
  dblclick?: EventListener
  input?: EventListener
  change?: EventListener
  blur?: EventListener
  focus?: EventListener
  focusin?: EventListener
  focusout?: EventListener
  scroll?: EventListener
  keyup?: EventListener
  keydown?: EventListener
  keypress?: EventListener
  submit?: EventListener
  cut?: EventListener
  copy?: EventListener
  mousedown?: EventListener
  mouseenter?: EventListener
  mouseleave?: EventListener
  mousemove?: EventListener
  mouseover?: EventListener
  mouseout?: EventListener
  mouseup?: EventListener
  touchcancel?: EventListener
  touchend?: EventListener
  touchmove?: EventListener
  touchstart?: EventListener
  resize?: EventListener
  play?: EventListener
  drag?: EventListener
}

export interface JsonElement {
  tag?: string
  attrs?: Attributes
  events?: JsonElementEvents
  children?: JsonElement[] | JsonElement
  innerHTML?: string
  innerText?: string
}

export interface JsonHtml {
  root: string
  attrs?: Attributes
  events?: JsonElementEvents
  children?: JsonElement[] | JsonElement
}

declare global {
  interface HTMLElement {
    _hash_id_?: symbol
  }
  interface Element {
    _hash_id_?: symbol
  }
}
