import { getUrl, removeQueryKeys } from '@belloai/qs'

interface PathParams {
  path?: string
  query?: any
}

type BeforeEachFunc = (to, from, next) => Promise<boolean>

type PartialRouterUtil = Partial<RouterUtil>

interface RouterUtilConstructorProps extends PartialRouterUtil {
  LS: any
  router: any
  auth?: any
}

class RouterUtil {
  NProgress: any
  LS: any
  router: any
  auth?: any
  getOtherLoginPath?: (query?: any) => Promise<string>

  debug = false

  loginPath = '/login'
  errorPath = '/main/error'
  canNoTokenPath: string[] = []

  whenQueryHaveTokenFunc?: any
  beforeEachFunc?: BeforeEachFunc
  afterEachFunc?: any

  constructor(props: RouterUtilConstructorProps) {
    Object.keys(props).forEach(key => {
      this[key] = props[key]
    })
    this.init()
  }

  log(...a) {
    if (this.debug) {
      console.log(...a)
    }
  }

  init() {
    const { NProgress } = this

    NProgress && NProgress.configure({ showSpinner: false })

    this.routerBeforeEach()
    this.routerAfterEach()
  }

  getPermissions(): string[] {
    const access = this.LS.get('access')
    const { permission } = access || {}
    return permission || []
  }

  checkPathPermission(path: string): boolean {
    if (this.auth) {
      return this.auth.checkRoutePermission({
        route: { path },
        permissions: this.getPermissions()
      })
    }
    return true
  }

  getHref(path: string, query?: any): string {
    if (!this.checkPathPermission(path)) {
      return ''
    }
    return this.router.resolve({
      path,
      query
    }).href
  }

  openPage(to: PathParams, target = '_blank'): void {
    const routeUrl = this.router.resolve(to)
    window.open(routeUrl.href, target)
  }

  async getLoginPath(query?): Promise<string> {
    let loginPath = this.LS.get('loginPath')

    if (loginPath) {
      loginPath = getUrl(loginPath, query)
    }

    if (this.getOtherLoginPath && !loginPath) {
      loginPath = await this.getOtherLoginPath(query)
    }

    if (!loginPath) {
      loginPath = this.getHref(this.loginPath, query)
    }
    return loginPath
  }

  gotoLoginPage(query?): void {
    this.getLoginPath(query).then(url => {
      location.replace(url)
    })
  }

  getToken(): string {
    return this.LS.get('token')
  }

  checkNeedLogin(path: string): boolean {
    const noToken = !this.getToken()
    const canNoLoginPathArr = [this.loginPath, ...this.canNoTokenPath]
    const isCanNoLoginPath = canNoLoginPathArr.includes(path)
    const needLogin = noToken && !isCanNoLoginPath
    this.log('checkNeedLogin', {
      path,
      needLogin,
      canNoLoginPathArr,
      isCanNoLoginPath,
      noToken
    })
    return needLogin
  }

  whenNotLogin(to): boolean {
    this.log('whenNotLogin', to)
    const { fullPath, path } = to || {}

    const needLogin = this.checkNeedLogin(path)

    if (needLogin) {
      this.LS.clearAllExcept()
      this.gotoLoginPage({ redirect: fullPath })
    }
    this.log('whenNotLogin needLogin', needLogin, to)
    return !needLogin
  }

  whenNotPermissions(path: string, next): boolean {
    this.log('whenNotPermissions', path)
    const havePermission = this.checkPathPermission(path)
    if (!havePermission) {
      console.warn(`${path} no auth`)
      next({
        path: this.errorPath
      })
    }

    return havePermission
  }

  async whenQueryHaveToken(to): Promise<boolean> {
    this.log('whenQueryHaveToken', to)
    const { query, fullPath } = to
    const { token } = query || {}
    const haveToken = !!token
    if (haveToken) {
      const oldToken = this.getToken()
      if (oldToken !== token) {
        this.LS.clearAllExcept()

        if (this.whenQueryHaveTokenFunc) {
          await this.whenQueryHaveTokenFunc(token)
        }
      }
      location.href = removeQueryKeys(fullPath, ['token'])
    }
    return !haveToken
  }

  routerBeforeEach(): void {
    this.log('routerBeforeEach', this)
    const { NProgress, beforeEachFunc } = this
    this.router.beforeEach(async (to, from, next) => {
      NProgress && NProgress.start()

      this.log('router.beforeEach', to)

      let canNext = await this.whenQueryHaveToken(to)

      if (canNext) {
        canNext = this.whenNotLogin(to)
      }
      if (canNext) {
        canNext = this.whenNotPermissions(to, next)
      }

      if (canNext && beforeEachFunc) {
        canNext = await beforeEachFunc(to, from, next)
      }

      if (canNext) {
        next()
      }
    })
  }

  routerAfterEach(): void {
    this.log('routerAfterEach', this)
    const { NProgress, afterEachFunc } = this
    this.router.afterEach(() => {
      NProgress && NProgress.done()
      afterEachFunc && afterEachFunc()
    })
  }
}

export default RouterUtil
