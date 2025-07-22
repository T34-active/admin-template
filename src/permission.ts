import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const hasToken = getToken()
  if (hasToken) {
    // 设置页面标题
    if (to.meta.title) {
      useSettingsStore().setTitle(to.meta.title)
    }
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
      return
    }
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    if (userStore.roles.length === 0) {
      try {
        isRelogin.show = true
        await userStore.getInfo()
        isRelogin.show = false
        const accessRoutes = await permissionStore.generateRoutes()
        accessRoutes.forEach((route) => {
          if (!isHttp(route.path)) {
            router.addRoute(route)
          }
        })
        // 确保动态路由添加完毕后跳转
        next({ ...to, replace: true })
      } catch (err) {
        await userStore.logOut()
        ElMessage.error(err as string)
        next({ path: '/' })
      }
    } else {
      next()
    }
  } else {
    // 没有 token 的情况
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
