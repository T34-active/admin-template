import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index.vue'
import ParentView from '@/components/ParentView/index.vue'
import InnerLink from '@/layout/components/InnerLink/index.vue'
import type { RouteRecordRaw } from 'vue-router'

// 匹配 views 目录下所有 .vue 文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])
  const defaultRoutes = ref<RouteRecordRaw[]>([])
  const topbarRouters = ref<RouteRecordRaw[]>([])
  const sidebarRouters = ref<RouteRecordRaw[]>([])

  function setRoutes(newRoutes: RouteRecordRaw[]) {
    addRoutes.value = newRoutes
    routes.value = constantRoutes.concat(newRoutes)
  }

  function setDefaultRoutes(newRoutes: RouteRecordRaw[]) {
    defaultRoutes.value = constantRoutes.concat(newRoutes)
  }

  function setTopbarRoutes(newRoutes: RouteRecordRaw[]) {
    topbarRouters.value = newRoutes
  }

  function setSidebarRouters(newRoutes: RouteRecordRaw[]) {
    sidebarRouters.value = newRoutes
  }

  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const res = await getRouters()
    const sdata = JSON.parse(JSON.stringify(res.data))
    const rdata = JSON.parse(JSON.stringify(res.data))
    const defaultData = JSON.parse(JSON.stringify(res.data))

    const sidebar = filterAsyncRouter(sdata)
    const rewrite = filterAsyncRouter(rdata, false, true)
    const defaultR = filterAsyncRouter(defaultData)

    const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
    asyncRoutes.forEach((route) => {
      router.addRoute(route)
    })

    setRoutes(rewrite)
    setSidebarRouters(constantRoutes.concat(sidebar))
    setDefaultRoutes(sidebar)
    setTopbarRoutes(defaultR)

    return rewrite
  }

  return {
    routes,
    addRoutes,
    defaultRoutes,
    topbarRouters,
    sidebarRouters,
    setRoutes,
    setDefaultRoutes,
    setTopbarRoutes,
    setSidebarRouters,
    generateRoutes,
  }
})

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(
  asyncRouterMap: any[],
  lastRouter = false,
  type = false,
): RouteRecordRaw[] {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route.children
      delete route.redirect
    }
    return true
  })
}

function filterChildren(childrenMap: any[], lastRouter: any = false): any[] {
  let children: any[] = []
  childrenMap.forEach((el) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach((c: any) => {
          c.path = `${el.path}/${c.path}`
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
          } else {
            children.push(c)
          }
        })
        return
      }
    }
    if (lastRouter) {
      el.path = `${lastRouter.path}/${el.path}`
    }
    children = children.concat(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
function filterDynamicRoutes(routes: any[]): any[] {
  const res: any[] = []
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

// 加载组件视图
export const loadView = (view: string) => {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
      break
    }
  }
  return res
}
export default usePermissionStore
