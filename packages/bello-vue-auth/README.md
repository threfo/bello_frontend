# `bello-vue-auth`

```ts
// src/router/index.ts
import Vue from 'vue'
import VueRouter from 'vue-router'
import RouterUtil from '@belloai/router'
import Auth from '@belloai/auth'

import NProgress from 'nprogress' // progress bar

import LS from '@/utils/localStorage'
import routes from './routes'

import { loadLanguageAsync } from '@/i18n'

Vue.use(VueRouter)
Vue.use(Auth)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export const auth = new Auth({
  router
})

export const routerUtil = new RouterUtil({
  debug: false,
  NProgress,
  LS,
  router,
  auth,
  canNoTokenPath: ['/'],
  whenQueryHaveTokenFunc: async token => {
    const { app } = router || {}
    app.$store.commit('userModule/setToken', token)
    await app.$store.dispatch('userModule/fetchUserInfo')
  },
  beforeEachFunc: async to => {
    console.log('beforeEachFunc', JSON.stringify(to))
    const { path, query } = to || {}
    const { app } = router || {}
    await app.$store.dispatch('configModule/getConfig', { path })
    const { lang } = query || {}
    if (lang) {
      await loadLanguageAsync(lang)
    }
    return true
  }
})

export default router
```
