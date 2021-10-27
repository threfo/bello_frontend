/* eslint-disable @typescript-eslint/no-var-requires */

const FileTransform = require('./FileTransform')
const VueFileTransform = require('./VueFileTransform')
const { saveFile } = require('./fileUtil')
const { fileCount } = require('./dependenciesCache')

const { cloneDeep } = require('lodash')

const pushRelatedRoutesMap = ({ relatedRoutesMap, key, route }) => {
  const relatedRoutes = relatedRoutesMap[key] || []
  relatedRoutes.push(route)
  relatedRoutesMap[key] = relatedRoutes
}

const pushComponent = ({ component, componentMap, routePath, routeItem }) => {
  const { funcName, value } = component || {}
  let componentPath
  if (funcName === 'load' && Array.isArray(value)) {
    componentPath = `/views/${value[0]}.vue`
  }
  if (componentPath) {
    const componentArr = componentMap[routePath] || []
    if (!componentArr.includes(componentPath)) {
      componentArr.push(componentPath)
      componentMap[routePath] = componentArr
    }
    return
  }
  const { redirect } = routeItem
  if (redirect) {
    return
  }
  console.error('componentPath not cover', component, routeItem)
}

const createRoute = ({
  parentPath = '',
  routeItem,
  routesMap,
  componentMap,
  relatedRoutesMap,
  duplicateRouteList
}) => {
  const { path, meta, component, children } = routeItem

  let routePath = path
  if (parentPath) {
    routePath = `${parentPath}/${path}`
  }

  if (Array.isArray(children)) {
    children.forEach(childrenItem => {
      createRoute({
        parentPath: routePath,
        routeItem: childrenItem,
        routesMap,
        componentMap,
        relatedRoutesMap,
        duplicateRouteList
      })
    })
  } else if (children) {
    console.error('createRoute children not cover', children, routeItem)
  } else {
    const duplicateRoute = routesMap[routePath]
    if (duplicateRoute) {
      // 处理重复的路由
      duplicateRouteList.push({
        ...routeItem,
        routePath
      })
    } else {
      const { name, authType = 'not_auth', activePath } = meta || {}
      const route = {
        name: name || routePath,
        key: `${authType}#${routePath}`
      }
      routesMap[routePath] = route

      pushRelatedRoutesMap({
        relatedRoutesMap,
        key: routePath,
        route
      })

      if (activePath && activePath !== routePath) {
        pushRelatedRoutesMap({
          relatedRoutesMap,
          key: activePath,
          route
        })
      }

      pushComponent({
        component,
        componentMap,
        routePath,
        routeItem
      })
    }
  }
}

const getViewItem = ({
  view,
  componentMap,
  vuePathEleAuthListMap,
  vuePathAuthFuncListMap,
  authType
}) => {
  // console.log('view', view)
  const { key: viewKey } = view

  const [, viewUrl] = viewKey.split('#')

  // console.log('viewUrl', viewUrl)

  const vueFileArr = componentMap[viewUrl] || []

  const eles = []
  const funcs = []

  vueFileArr.forEach(vueFile => {
    const vueEles = vuePathEleAuthListMap[vueFile] || []
    if (vueEles.length) {
      eles.push(...vueEles)
    }
    const vueFuncs = vuePathAuthFuncListMap[vueFile] || []
    if (vueFuncs.length) {
      funcs.push(...vueFuncs)
    }
  })
  const funcsKeys = funcs
    .map(item => JSON.stringify(item))
    .filter((t, i, arr) => arr.indexOf(t) === i)

  return {
    ...view,
    funcs: funcsKeys.map(keyStr => JSON.parse(keyStr)),
    eles: eles
      .map(ele => {
        const { eleKey, authType: eleAuthType } = ele

        return {
          ...ele,
          key: `${eleAuthType || authType}#${viewUrl}#${eleKey}`
        }
      })
      .filter((v, i, arr) => {
        const { key } = v

        return arr.findIndex(({ key: checkKey }) => checkKey === key) === i
      })
  }
}
const getViewTrackItem = ({ view, componentMap, vuePathTrackFuncListMap }) => {
  const { key: viewKey } = view

  const [, viewUrl] = viewKey.split('#')

  // console.log('componentMap', componentMap)
  // console.log('viewUrl', viewUrl)
  // console.log('vuePathTrackFuncListMap', vuePathTrackFuncListMap)

  const vueFileArr = componentMap[viewUrl] || []

  const tracks = []
  vueFileArr.forEach(vueFile => {
    const vueTrackFuncs = vuePathTrackFuncListMap[vueFile] || []
    if (vueTrackFuncs.length) {
      tracks.push(...vueTrackFuncs)
    }
  })
  if (!tracks.length) {
    return {}
  }
  return {
    ...view,
    tracks
  }
}

const createMenu = ({
  parentName = '',
  menuItem,
  routesMap,
  menuMap,
  menuTrackMap,
  relatedRoutesMap,
  componentMap,
  vuePathEleAuthListMap,
  vuePathAuthFuncListMap,
  vuePathTrackFuncListMap
}) => {
  const { index, name, children } = menuItem

  if (Array.isArray(children)) {
    children.forEach(childrenItem => {
      createMenu({
        parentName: name,
        menuItem: childrenItem,
        routesMap,
        menuMap,
        menuTrackMap,
        relatedRoutesMap,
        componentMap,
        vuePathEleAuthListMap,
        vuePathAuthFuncListMap,
        vuePathTrackFuncListMap
      })
    })
  } else if (children) {
    console.error('createMenu children not cover', children, menuItem)
  } else {
    const route = routesMap[index]
    if (!route) {
      console.error('menu not match route', menuItem)
      return
    }

    const { name: routeName, key } = route
    let menuName = name || routeName
    if (parentName) {
      menuName = `${parentName} - ${menuName}`
    }

    const [authType, routeUrl] = key.split('#')

    const menus = menuMap[authType] || []
    const menusTrack = menuTrackMap[authType] || []
    // console.log('routeUrl', routeUrl)
    const views = relatedRoutesMap[routeUrl] || []
    // console.log('views', views)

    const menu = {
      key,
      name: menuName,
      views: views.map(view => {
        return getViewItem({
          view,
          componentMap,
          vuePathEleAuthListMap,
          vuePathAuthFuncListMap,
          authType
        })
      })
    }
    menus.push(menu)

    menuMap[authType] = menus
    // 对没用到打点的view视图进行过滤
    const viewsTrack = views.map(view => {
      const result = getViewTrackItem({
        view,
        componentMap,
        vuePathTrackFuncListMap,
        authType
      })
      if (Object.keys(result).length) {
        return result
      }
    })

    const menuTrack = {
      key,
      name: menuName,
      views: viewsTrack.filter(view => view)
    }
    menusTrack.push(menuTrack)
    menuTrackMap[authType] = menusTrack
  }
}

const checkNotMenuRoute = ({
  routesMap,
  menuMap,
  componentMap,
  vuePathEleAuthListMap,
  vuePathAuthFuncListMap
}) => {
  const viewsUrl = []

  Object.keys(menuMap).forEach(key => {
    const menus = menuMap[key] || []

    menus.forEach(menuItem => {
      const { views } = menuItem

      ;(views || []).forEach(viewItem => {
        const { key } = viewItem

        const [, url] = key.split('#')

        if (url && !viewsUrl.includes(url)) {
          viewsUrl.push(url)
        }
      })
    })
  })

  const cloneRoutesMap = cloneDeep(routesMap)

  viewsUrl.forEach(url => {
    delete cloneRoutesMap[url]
  })

  const notMenuViews = Object.keys(cloneRoutesMap)
    .map(url => {
      const view = cloneRoutesMap[url]
      const { key } = view
      const [authType] = key.split('#')
      if (authType === 'not_auth') {
        return
      }
      return getViewItem({
        view,
        componentMap,
        vuePathEleAuthListMap,
        vuePathAuthFuncListMap,
        authType
      })
    })
    .filter(i => i)

  if (notMenuViews.length) {
    menuMap['notMenuViews'] = notMenuViews
  }
}

module.exports = ({ routesPath, menuPath, buildJsonPath }) => {
  const startTime = new Date().getTime()

  const routesFileTransform = new FileTransform({ path: routesPath })
  const { rootPath } = routesFileTransform

  const buildPath = `${rootPath}${buildJsonPath}`
  saveFile('routes_json.json', routesFileTransform.exportDefault, buildPath)
  const meunFileTransform = new FileTransform({ path: menuPath })
  saveFile('menu_json.json', meunFileTransform.exportDefault, buildPath)

  const { exportDefault: routesJson } = routesFileTransform
  const { exportDefault: menuJson } = meunFileTransform

  const routesMap = {}
  const componentMap = {}
  const vuePathEleAuthListMap = {}
  const vuePathAuthFuncListMap = {}
  const vuePathTrackFuncListMap = {}
  const relatedRoutesMap = {}
  const duplicateRouteList = []

  routesJson.forEach(routeItem => {
    createRoute({
      routeItem,
      routesMap,
      componentMap,
      relatedRoutesMap,
      duplicateRouteList
    })
  })

  // console.log('routesMap:', routesMap)
  // console.log('componentMap:', componentMap)
  // console.log('relatedRoutesMap:', relatedRoutesMap)
  // console.log('duplicateRouteList:', duplicateRouteList)

  // console.log('rootPath:', rootPath)
  // 历遍该路由的关联的 vue 文件
  Object.keys(componentMap).forEach(key => {
    const componentArr = componentMap[key]
    componentArr.forEach(vueFilePath => {
      const path = `${rootPath}/src${vueFilePath}`
      // console.log('vueFilePath', vueFilePath)
      // console.log('path', path)

      const { eleAuthList, authFuncList, trackFuncList } = new VueFileTransform(
        { path }
      )
      // console.log(
      //   `解析 key: ${key}, path: ${path} ,eleAuthList: `,
      //   eleAuthList.length
      // )
      if (eleAuthList.length) {
        vuePathEleAuthListMap[vueFilePath] = eleAuthList
      }
      if (authFuncList.length) {
        vuePathAuthFuncListMap[vueFilePath] = authFuncList
      }
      if (trackFuncList.length) {
        vuePathTrackFuncListMap[vueFilePath] = trackFuncList
      }
    })
  })
  // console.log('vuePathAuthFuncListMap:', vuePathAuthFuncListMap)
  // console.log('vuePathEleAuthListMap:', vuePathEleAuthListMap)

  // saveFile('vuePathEleAuthListMap.json', vuePathEleAuthListMap, buildPath)
  // saveFile('componentMap.json', componentMap, buildPath)
  const menuMap = {}
  const menuTrackMap = {}

  menuJson.forEach(menuItem => {
    createMenu({
      menuItem,
      routesMap,
      menuMap,
      menuTrackMap,
      relatedRoutesMap,
      componentMap,
      vuePathEleAuthListMap,
      vuePathAuthFuncListMap,
      vuePathTrackFuncListMap
    })
  })

  checkNotMenuRoute({
    routesMap,
    menuMap,
    componentMap,
    vuePathEleAuthListMap,
    vuePathAuthFuncListMap
  })

  // console.log('menuMap:', menuMap)

  saveFile('auth_json.json', menuMap, buildPath)
  saveFile('track_json.json', menuTrackMap, buildPath)
  const endTime = new Date().getTime()
  console.log(
    `共分析了 ${fileCount()} 个文件，
    路由: ${Object.keys(routesMap).length} 个，
    权限模块: ${Object.keys(menuMap).length} 个，
    打点模块: ${Object.keys(menuMap).length} 个，
    有使用到<auth>标签的页面共: ${Object.keys(vuePathEleAuthListMap).length} 个,
    有使用到$auth方法的页面共: ${Object.keys(vuePathAuthFuncListMap).length} 个,
    有使用到$report方法的页面共: ${
      Object.keys(vuePathTrackFuncListMap).length
    } 个,
    耗时 ${(endTime - startTime) / 1000}s`
  )

  if (duplicateRouteList.length) {
    console.error(
      `警告⚠️警告⚠️警告⚠️警告⚠️：发现重复的路由定义 ${duplicateRouteList.length}个`,
      duplicateRouteList
    )
  }
}
