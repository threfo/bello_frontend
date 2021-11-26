import * as utils from './utils'

export default class Auth {
  authFn: () => false
  routeMap: Map<string, utils._RouteConfig>
  menu: utils.MenuItem[]
  permissions: string[]
  permissionRouterMap: Map<string, string[]>
  constructor({
    authFn,
    routes,
    menu,
    permissions
  }: {
    authFn?: any
    routes: utils._RouteConfig[]
    menu: utils.MenuItem[]
    permissions?: string[]
  }) {
    this.authFn =
      Object.prototype.toString.call(authFn) === '[object Function]'
        ? authFn
        : utils.defaultAuthFn

    this.routeMap = utils.getRouterMapByRouter(routes)
    this.permissionRouterMap = utils.getPermissionMapByRouterMap(this.routeMap)
    this.menu = utils.getMenuByRouteMap(menu, this.routeMap)
    this.permissions = permissions || []
  }
  static install(Vue): void {
    Vue.prototype.$auth = function (permission: string): boolean {
      const haveAuth = this.authFn(permission, this.permissions)
      if (!haveAuth) {
        console.warn('没有权限', permission)
      }

      return haveAuth
    }
  }
  updatePermissions(permissions) {
    this.permissions = permissions
  }
  updateRouter(routes: utils._RouteConfig[]): utils._RouteConfig[] {
    this.routeMap = utils.getRouterMapByRouter(routes)
    this.permissionRouterMap = utils.getPermissionMapByRouterMap(this.routeMap)

    return routes
  }
  updateMenu(menu: utils.MenuItem[]): utils.MenuItem[] {
    this.menu = utils.getMenuByRouteMap(menu, this.routeMap)
    return this.menu
  }
  checkRoutePermission({
    route,
    permissions
  }: {
    route: utils._Route
    permissions: string[]
  }): boolean {
    return utils.getPermissionMenuItem({
      routerPermissions: this.permissionRouterMap.get(
        route?.fullPath || route?.path
      ),
      permissions
    })
  }
  getMenuByPermissions(permissions: string[]): utils.MenuItem[] {
    return utils.getPermissionMenuList(this.routeMap, this.menu, permissions)
  }
}
