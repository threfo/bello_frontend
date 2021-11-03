import {
  getRouterFullPath,
  getRouteName,
  getRouterMapByRouter,
  getPermissionMapByPermission,
  getMenuByRouteMap,
  getPermissionMapByRouterMap,
  getPermissionItemByRouter,
  getPermissionMenuItem,
  getPermissionMenuList,
  defaultAuthFn
} from '../src/utils'

const mockDashboardRoute = {
  name: 'dashboard',
  path: 'dashboard',
  component: () => {},
  meta: {
    authType: 'view_dashboard'
  }
}

const mockMainRoute = {
  name: 'main',
  path: '/main',
  component: () => {},
  children: [
    {
      path: 'xsearch',
      component: () => {},
      meta: {
        name: 'xsearch'
      }
    },
    {
      path: 'email',
      meta: {
        name: 'email',
        authType: 'view_enterprise_manage'
      }
    },
    mockDashboardRoute
  ]
}

const mockDashboardMenu = {
  icon: 'icon-dashboard_icon1',
  name: '仪表盘',
  index: '/main/dashboard'
}

const mockSettingMenu = {
  icon: 'icon-install_icon',
  name: '设置',
  index: 'setting',
  children: [
    {
      name: '企业管理',
      index: '/main/enterprise-manage'
    },
    {
      name: '邮箱聚合',
      index: '/main/email'
    }
  ]
}

const mockEnterpriseRoute = {
  path: '/main/enterprise-manage',
  component: () => {},
  meta: {
    authType: 'view_business_manage'
  }
}

const mockEmailRoute = {
  path: '/main/email',
  component: () => {},
  meta: {
    authType: 'view_talent_collect'
  }
}

const mockEmailMenu = {
  name: '邮箱',
  index: '/main/email'
}

const mockRoute = [
  {
    path: '*',
    name: 'notFound',
    redirect: '/main/not-found'
  },
  {
    path: '/',
    name: 'main',
    redirect: '/main'
  },
  mockMainRoute,
  mockEnterpriseRoute
]

describe('src/utils.ts', () => {
  it('getRouterFullPath', () => {
    const test1 = getRouterFullPath(
      {
        path: 'live'
      },
      '/test'
    )

    expect(test1).toBe('/test/live')

    const test2 = getRouterFullPath(
      {
        path: '/test'
      },
      ''
    )
    expect(test2).toBe('/test')
  })

  it('getRouteName', () => {
    const test1 = getRouteName({
      path: '/home'
    })
    expect(test1).toBe('')

    const test2 = getRouteName({
      path: '/home',
      meta: {
        name: 'home'
      }
    })
    expect(test2).toBe('home')

    const test3 = getRouteName({
      path: '/home',
      name: 'home',
      meta: {
        name: '主页'
      }
    })
    expect(test3).toBe('主页')
  })

  it('getRouterMapByRouter', () => {
    const test1 = getRouterMapByRouter([mockDashboardRoute, mockMainRoute])
    const mock1 = new Map([
      [
        'dashboard',
        {
          name: 'dashboard',
          path: 'dashboard',
          meta: { authType: 'view_dashboard' }
        }
      ],
      [
        '/main',
        {
          name: 'main',
          path: '/main',
          children: [
            { path: 'xsearch', meta: { name: 'xsearch' } },
            {
              path: 'email',
              meta: { name: 'email', authType: 'view_enterprise_manage' }
            },
            {
              name: 'dashboard',
              path: 'dashboard',
              meta: { authType: 'view_dashboard' }
            }
          ]
        }
      ],
      [
        '/main/xsearch',
        { path: 'xsearch', meta: { name: 'xsearch' }, name: 'xsearch' }
      ],
      [
        '/main/email',
        {
          path: 'email',
          meta: { name: 'email', authType: 'view_enterprise_manage' },
          name: 'email'
        }
      ],
      [
        '/main/dashboard',
        {
          name: 'dashboard',
          path: 'dashboard',
          meta: { authType: 'view_dashboard' }
        }
      ]
    ])

    expect(JSON.stringify(Array.from(test1))).toBe(
      JSON.stringify(Array.from(mock1))
    )
  })

  it('getPermissionMapByPermission', () => {
    const test1 = getPermissionMapByPermission([
      'view_test#index',
      'view_test#detail',
      'view_test#home',
      'view_test',
      'view_disable'
    ])

    const mock1 = new Map([
      [
        'view_test',
        ['view_test#index', 'view_test#detail', 'view_test#home', 'view_test']
      ],
      ['view_disable', ['view_disable']]
    ])

    expect(JSON.stringify(test1)).toBe(JSON.stringify(mock1))

    const test2 = getPermissionMapByPermission([
      'view_test1',
      'view_test2',
      'view_test3',
      'view_test4',
      'view_disable'
    ])

    const mock2 = new Map([
      ['view_test1', ['view_test1']],
      ['view_test2', ['view_test2']],
      ['view_test3', ['view_test3']],
      ['view_test4', ['view_test4']],
      ['view_disable', ['view_disable']]
    ])
    expect(JSON.stringify(Array.from(test2))).toBe(
      JSON.stringify(Array.from(mock2))
    )
  })

  it('getMenuByRouteMap', () => {
    const routeMap = getRouterMapByRouter(mockRoute)

    const test1 = getMenuByRouteMap([mockDashboardMenu], routeMap)
    expect(JSON.stringify(test1)).toBe(JSON.stringify([mockDashboardMenu]))

    const test2 = getMenuByRouteMap(
      [mockDashboardMenu, mockEmailMenu],
      routeMap
    )
    expect(JSON.stringify(test2)).toBe(
      JSON.stringify([mockDashboardMenu, mockEmailMenu])
    )
  })

  it('getPermissionMapByRouterMap', () => {
    const routeMap = getRouterMapByRouter([...mockRoute, mockEmailRoute])
    const test1 = getPermissionMapByRouterMap(routeMap)

    const mock1 = new Map([
      ['*', ['not_auth', 'not_auth#*']],
      ['/', ['not_auth', 'not_auth#/']],
      ['/main', ['not_auth', 'not_auth#/main']],
      ['/main/xsearch', ['not_auth', 'not_auth#/main/xsearch']],
      [
        '/main/email',
        ['view_talent_collect', 'view_talent_collect#/main/email']
      ],
      ['/main/dashboard', ['view_dashboard', 'view_dashboard#/main/dashboard']],
      [
        '/main/enterprise-manage',
        ['view_business_manage', 'view_business_manage#/main/enterprise-manage']
      ]
    ])

    expect(JSON.stringify(Array.from(test1))).toBe(
      JSON.stringify(Array.from(mock1))
    )
  })
  it('getPermissionItemByRouter', () => {
    const test = getPermissionItemByRouter(
      mockEnterpriseRoute,
      mockEnterpriseRoute.path
    )

    const mock = new Map([
      [
        '/main/enterprise-manage',
        ['view_business_manage', 'view_business_manage#/main/enterprise-manage']
      ]
    ])

    expect(JSON.stringify(Array.from(test))).toBe(
      JSON.stringify(Array.from(mock))
    )
  })
  it('getPermissionMenuItem', () => {
    const routeMap = getRouterMapByRouter(mockRoute)
    const routePermissionMap = getPermissionMapByRouterMap(routeMap)
    const permissions = []

    const path1 = mockSettingMenu.index
    const test1 = getPermissionMenuItem({
      routerPermissions: routePermissionMap.get(path1),
      permissions
    })

    expect(test1).toBe(true)

    const path2 = mockSettingMenu.children[0].index
    const test2 = getPermissionMenuItem({
      routerPermissions: routePermissionMap.get(path2),
      permissions
    })

    expect(test2).toBe(false)
  })
  it('getPermissionMenuList', () => {
    const routerMap = getRouterMapByRouter(mockRoute)
    const menus = [mockDashboardMenu, mockEmailMenu]
    const permissions1 = []

    const test1 = getPermissionMenuList(routerMap, menus, permissions1)
    expect(JSON.stringify(test1)).toBe(JSON.stringify([]))

    const permissions2 = [
      'view_dashboard',
      'view_business_manage',
      'view_business_manage#/main/enterprise-manage'
    ]
    // 没有name的route会被过滤掉
    const test2 = getPermissionMenuList(routerMap, menus, permissions2)
    expect(JSON.stringify(test2)).toBe(
      JSON.stringify([
        {
          icon: 'icon-dashboard_icon1',
          name: '仪表盘',
          index: '/main/dashboard'
        }
      ])
    )
  })
  it('defaultAuthFn', () => {
    const test = defaultAuthFn('1', ['1', '2', '3'])

    expect(test).toBe(true)
  })
})
