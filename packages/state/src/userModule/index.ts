import { UserInfo, UserI18n } from './interface'
import { getUserName, getJwtPayload } from './utils'

export interface UserModuleState {
  i18n: UserI18n
  userInfo: null | UserInfo // 用户信息
  token: string // token信息
  guideStep: any // 指引
  logOuting: boolean
  access: null | Access
}

export interface Access {
  roles: string[]
  permission: string[]
  groups: string[]
}

export type LogoutFunc = ({
  userInfo,
  token
}: {
  userInfo: UserInfo
  token: string
}) => void

export type GetAccessFunc = (userId: string) => Promise<Access>
export type GetUserInfoFunc = (userId: string) => Promise<UserInfo>
export type GetGuideStepFunc = (userId: string) => Promise<any>
export interface InitUserModuleProps {
  i18n: UserI18n
  LS: any
  logoutFunc: LogoutFunc
  getAccessFunc: GetAccessFunc
  getUserInfoFunc: GetUserInfoFunc
  getGuideStepFunc: GetGuideStepFunc
}

const initState = ({
  i18n,
  token = '',
  userInfo,
  guideStep
}): UserModuleState => ({
  userInfo,
  token,
  i18n,
  guideStep,
  logOuting: false,
  access: null
})

export const initUserModule = ({
  i18n,
  LS,
  logoutFunc,
  getAccessFunc,
  getUserInfoFunc,
  getGuideStepFunc
}: InitUserModuleProps) => ({
  namespaced: true,
  state: initState({
    i18n,
    token: LS.get('token'),
    userInfo: LS.get('userInfo'),
    guideStep: LS.get('needGuide')
  }),
  getters: {
    currentUserId(state: UserModuleState) {
      const { id } = state.userInfo || {}
      return id || ''
    },
    currentUserName(state: UserModuleState) {
      return getUserName(state)
    },

    permission(state: UserModuleState) {
      const { permission } = state.access || {}
      return permission || []
    },
    tokenInfo(state: UserModuleState) {
      return getJwtPayload(state.token)
    },
    tokenInfoUserId(_, getters) {
      const { user_id } = getters.tokenInfo || {}
      return user_id
    }
  },
  mutations: {
    setUserInfo(state: UserModuleState, userInfo: UserInfo): void {
      state.userInfo = userInfo
      LS.set('userInfo', userInfo)
    },
    setToken(state: UserModuleState, token: string): void {
      state.token = token
      LS.set('token', token)
    },
    setAccess(state: UserModuleState, access: Access): void {
      state.access = access
      LS.set('access', access)
    },
    setGuideStep(state: UserModuleState, guideStep: any): void {
      state.guideStep = guideStep
      LS.set('guideStep', guideStep)
    },
    logout(state: UserModuleState) {
      state.token = ''
      state.userInfo = null
      state.logOuting = true
      state.access = null
      state.guideStep = null
      LS.clearAllExcept()
    }
  },
  actions: {
    logout({ state, commit }) {
      const { userInfo, token } = state
      logoutFunc({ userInfo, token })
      commit('logout')
    },

    tokenTimeout({ commit }) {
      commit('setToken', '')
    },
    async fetchAccess({ getters, commit }) {
      const { tokenInfoUserId } = getters
      let access: null | Access = null
      if (tokenInfoUserId) {
        // 权限列表信息
        access = await getAccessFunc(tokenInfoUserId)
      }
      commit('setAccess', access)
      return access
    },
    async fetchUserInfo({ getters, commit }) {
      const { tokenInfoUserId } = getters
      if (!tokenInfoUserId) {
        console.error('登录token无效')
        return
      }

      const [userInfo, access, guideStep] = await Promise.all([
        getUserInfoFunc(tokenInfoUserId),
        getAccessFunc(tokenInfoUserId),
        getGuideStepFunc(tokenInfoUserId)
      ])
      commit('setUserInfo', userInfo)
      commit('setAccess', access)
      commit('setGuideStep', guideStep)
      return userInfo
    }
  }
})

export default initUserModule
