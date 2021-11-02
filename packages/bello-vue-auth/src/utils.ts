import { Route, RouteConfig } from 'vue-router'

export type _RouteConfig = RouteConfig
export type _Route = Route
export type RouteItem = _RouteConfig | _Route

export interface MenuItem {
  icon?: string
  index: string
  name?: string
  children?: MenuItem[]
}

export const getRouterFullPath = (
  route: RouteConfig,
  parentPath: string
): string => {
  const { path, meta } = route || {}
  const { activePath } = meta || {}
  return activePath || [parentPath, path].filter(i => i).join('/')
}

export const getRouteName = (route: RouteConfig): string => {
  const { name, meta } = route || {}
  if (!meta) {
    return name || ''
  }
  return meta?.name || name
}

export const getRouterMapByRouter = (
  routes: RouteConfig[] = []
): Map<string, RouteConfig> => {
  const routerMap = new Map()

  const deepSetMap = (children: RouteConfig[], parentPath: string) => {
    children.forEach(route => {
      const path = getRouterFullPath(route, parentPath)

      if (routerMap.has(path)) {
        console.warn(`name: ${path} 有重复定义的路由`)
      }

      routerMap.set(path, { ...route, name: getRouteName(route) })

      if (route?.children?.length) {
        deepSetMap(route.children, path)
      }
    })
  }

  deepSetMap(routes, '')
  return routerMap
}

export const getPermissionMapByPermission = (
  permissions: string[]
): Map<string, string[]> => {
  const permissionMap = new Map()
  permissions.forEach(item => {
    const [authType] = String(item).split('#')
    const arr = permissionMap.get(authType) || []

    if (!arr.includes(item)) {
      arr.push(item)
    }

    permissionMap.set(authType, arr)
  })

  return permissionMap
}

export const getMenuByRouteMap = (
  menuList: Array<MenuItem>,
  routeMap: Map<string, RouteConfig>
): Array<MenuItem> => {
  if (!menuList?.length) {
    return menuList
  }
  return menuList
    .map((menu: MenuItem | any) => {
      const { index: menuPath, name: menuName, children } = menu
      const route = routeMap.get(menuPath)
      const childrenList = getMenuByRouteMap(children, routeMap)

      if ((!route || !route?.name) && (!childrenList || !childrenList.length)) {
        console.warn(`${menuPath} 没有定义在路由中`)
        return null
      }

      const name = menuName || route?.name

      return {
        ...menu,
        children: childrenList,
        name
      }
    })
    .filter(i => i)
}

export const getPermissionMapByRouterMap = (
  routeMap: Map<string, RouteConfig>
): Map<string, string[]> => {
  const pathPermissionMap = new Map()

  routeMap.forEach((route, path) => {
    const routeItemPermissionMap = getPermissionItemByRouter(route, path)
    routeItemPermissionMap.forEach((rule, itemPath) => {
      pathPermissionMap.set(itemPath, rule)
    })
  })

  return pathPermissionMap
}

export const getPermissionItemByRouter = (
  route: RouteConfig,
  path: string
): Map<string, string[]> => {
  const { meta } = route
  const { authType: permission = 'not_auth' } = meta || {}

  const pathPermissionMapItem = new Map()

  if (permission) {
    let permissionValue = permission
    if (!Array.isArray(permission)) {
      permissionValue = [permission]
    }

    const selfPermission = `${permission}#${path}`
    if (!permissionValue.includes(selfPermission)) {
      permissionValue.push(selfPermission)
    }

    pathPermissionMapItem.set(path, permissionValue)
  }
  return pathPermissionMapItem
}

export const getPermissionMenuItem = ({
  routerPermissions,
  permissions
}: {
  routerPermissions: string[] | undefined
  permissions: string[]
}): boolean => {
  const needChecks = routerPermissions || []
  if (
    !needChecks.length ||
    needChecks.some(rule => rule.split('#').includes('not_auth'))
  ) {
    return true
  }

  const permissionMap = getPermissionMapByPermission(permissions)
  const authRule = needChecks.find(rule => !~rule.indexOf('#')) || ''
  const authPermissionList = permissionMap.get(authRule) || []

  if (authPermissionList?.length > 1) {
    return needChecks.every(rule => permissions.includes(rule))
  } else {
    return authPermissionList.includes(authRule)
  }
}

export const getPermissionMenuList = (
  routerMap: Map<string, RouteConfig>,
  menus: MenuItem[],
  permissions: string[]
): MenuItem[] => {
  return getMenuByRouteMap(menus, routerMap).filter(menu =>
    getPermissionMenuItem({
      routerPermissions: getPermissionMapByRouterMap(routerMap).get(menu.index),
      permissions
    })
  )
}

export const defaultAuthFn = (
  permission: string,
  permissions: string[]
): boolean => {
  return permissions.includes(permission)
}
