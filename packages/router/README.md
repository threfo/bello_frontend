# `router`

> router 常用方法

## Usage

```js
import { initRouterUtils } from '@belloai/router'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export const { gotoLoginPage, checkPathPermission, getHref, openPage } =
  initRouterUtils({ router })

export default router
```
