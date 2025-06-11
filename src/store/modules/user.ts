import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore('user', () => {
  const token = ref<string | undefined>(getToken())
  const name = ref('')
  const avatar = ref('')
  const roles = ref([])
  const permissions = ref<string[]>([])
  const userInfo = reactive<Record<string, any>>({})

  // 登录
  function loginAction(userInfoInput: {
    username: string
    password: string
    code: string
    uuid: string
  }) {
    const username = userInfoInput.username.trim()
    const password = userInfoInput.password
    const code = userInfoInput.code
    const uuid = userInfoInput.uuid
    return new Promise((resolve, reject) => {
      login(username, password, code, uuid)
        .then((res) => {
          setToken(res.token)
          token.value = res.token
          resolve(1)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 获取用户信息
  function getInfoAction() {
    return new Promise((resolve, reject) => {
      getInfo()
        .then((res) => {
          const user = res.user
          const ava =
            user.avatar === '' || user.avatar === null
              ? defAva
              : import.meta.env.VITE_APP_BASE_URL + user.avatar

          if (res.roles && res.roles.length > 0) {
            roles.value = res.roles
            permissions.value = res.permissions
          } else {
            roles.value = ['ROLE_DEFAULT']
          }

          Object.assign(userInfo, res.user)
          name.value = user.userName
          avatar.value = ava
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 退出登录
  function logOutAction() {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          token.value = ''
          roles.value = []
          permissions.value = []
          removeToken()
          resolve(1)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  return {
    token,
    name,
    avatar,
    roles,
    permissions,
    userInfo,
    login: loginAction,
    getInfo: getInfoAction,
    logOut: logOutAction,
  }
})

export default useUserStore
