import type { RouteRecordRaw } from 'vue-router'
import { isExternal } from '@/utils/validate'
import { getNormalPath } from '@/utils/ruoyi'

export type SidebarRoute = RouteRecordRaw & {
  hidden?: boolean
  alwaysShow?: boolean
  children?: SidebarRoute[]
  query?: string
  noShowingChildren?: boolean
}

export interface ResolvedSidebarItem {
  type: 'leaf' | 'branch'
  item: SidebarRoute
  path: string
  to: string | { path: string; query?: Record<string, string> }
  title: string
  icon: string
  children: SidebarRoute[]
}

export function resolveMenuPath(
  basePath: string,
  routePath: string,
  routeQuery?: string,
): string | { path: string; query: Record<string, string> } {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(basePath)) {
    return basePath
  }

  const path = routePath.startsWith('/')
    ? getNormalPath(routePath)
    : getNormalPath(`${basePath}/${routePath}`)

  if (routeQuery) {
    return { path, query: JSON.parse(routeQuery) }
  }
  return path
}

export function resolveChildBasePath(basePath: string, childPath: string) {
  const resolved = resolveMenuPath(basePath, childPath)
  return typeof resolved === 'string' ? resolved : resolved.path
}

export function pathToKey(to: ResolvedSidebarItem['to']): string {
  if (typeof to === 'string') {
    return to
  }
  const query = to.query ? `?${new URLSearchParams(to.query).toString()}` : ''
  return `${to.path}${query}`
}

function getVisibleChildren(children: SidebarRoute[] = []) {
  return children.filter((child) => !child.hidden)
}

function buildRouteTarget(basePath: string, routeQuery?: string): ResolvedSidebarItem['to'] {
  const path = getNormalPath(basePath)
  if (routeQuery) {
    return { path, query: JSON.parse(routeQuery) }
  }
  return path
}

export function resolveSidebarItem(
  item: SidebarRoute,
  basePath: string,
): ResolvedSidebarItem | null {
  if (item.hidden) {
    return null
  }

  const visibleChildren = getVisibleChildren(item.children)
  const nodePath = getNormalPath(basePath)

  if (visibleChildren.length === 1 && !item.alwaysShow) {
    const onlyChild = visibleChildren[0]
    const childPath = resolveMenuPath(basePath, onlyChild.path, onlyChild.query)
    return {
      type: 'leaf',
      item: onlyChild,
      path: pathToKey(
        typeof childPath === 'string'
          ? childPath
          : { path: childPath.path, query: childPath.query },
      ),
      to: childPath,
      title: onlyChild.meta?.title || item.meta?.title || '',
      icon: onlyChild.meta?.icon || item.meta?.icon || '',
      children: [],
    }
  }

  const to = buildRouteTarget(nodePath, item.query)
  const pathKey = pathToKey(to)

  if (visibleChildren.length === 0) {
    return {
      type: 'leaf',
      item,
      path: pathKey,
      to,
      title: item.meta?.title || '',
      icon: item.meta?.icon || '',
      children: [],
    }
  }

  return {
    type: 'branch',
    item,
    path: pathKey,
    to,
    title: item.meta?.title || '',
    icon: item.meta?.icon || '',
    children: visibleChildren,
  }
}

export function collectOpenKeys(
  routes: SidebarRoute[],
  activeMenu: string,
): string[] {
  const keys: string[] = []

  function walk(items: SidebarRoute[], parentPath: string): boolean {
    for (const route of items) {
      if (route.hidden) {
        continue
      }

      const nodePath = resolveChildBasePath(parentPath, route.path)
      const resolved = resolveSidebarItem(route, nodePath)
      if (!resolved) {
        continue
      }

      if (resolved.type === 'leaf') {
        if (isActivePath(resolved.path, activeMenu)) {
          return true
        }
        continue
      }

      const matched = walk(resolved.children, nodePath)
      if (matched) {
        keys.unshift(resolved.path)
        return true
      }
    }
    return false
  }

  for (const route of routes) {
    if (walk([route], '')) {
      break
    }
  }

  return keys
}

export function isActivePath(menuPath: string, activeMenu: string) {
  if (!menuPath || !activeMenu) {
    return false
  }
  return menuPath === activeMenu
}

export function hasActiveDescendant(
  children: SidebarRoute[] | undefined,
  activeMenu: string,
  basePath: string,
): boolean {
  if (!children?.length) {
    return false
  }

  return children.some((child) => {
    const childPath = resolveChildBasePath(basePath, child.path)
    const resolved = resolveSidebarItem(child, childPath)
    if (!resolved) {
      return false
    }
    if (resolved.type === 'leaf') {
      return isActivePath(resolved.path, activeMenu)
    }
    return (
      isActivePath(resolved.path, activeMenu) ||
      hasActiveDescendant(resolved.children, activeMenu, childPath)
    )
  })
}
