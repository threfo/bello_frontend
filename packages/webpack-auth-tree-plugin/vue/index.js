/* eslint-disable @typescript-eslint/no-var-requires */
const { isFunction } = require('lodash')

module.exports = class Auth {
  constructor(authFn) {
    return this.install(authFn)
  }
  install(authFn) {
    const auth = isFunction(authFn) ? authFn : this.defaultAuthFn
    return {
      install: function (Vue) {
        Vue.prototype.$auth = function (permission) {
          const haveAuth = auth(permission, this.$store)
          if (!haveAuth) {
            console.warn('没有权限', permission)
          }

          return haveAuth
        }
      }
    }
  }
  defaultAuthFn(permission, store) {
    if (!store) {
      return false
    }

    const { permission: permissionArr } = store.state || {}
    return (permissionArr || []).includes(permission)
  }
}
