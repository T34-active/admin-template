import request from '@/utils/request'

/**
 * 获取菜单列表。
 *
 * @param query - 查询参数，用于筛选菜单列表。
 * @returns 包含菜单列表数据的 Promise。
 */
export function listMenu(query): Promise<any> {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定菜单的详细信息。
 *
 * @param menuId - 菜单的唯一标识符。
 * @returns 包含菜单详细信息的 Promise。
 */
export function getMenu(menuId): Promise<any> {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get',
  })
}

/**
 * 获取用于下拉选择的菜单树结构数据。
 *
 * @returns 包含菜单树结构的 Promise。
 */
export function treeselect(): Promise<any> {
  return request({
    url: '/system/menu/treeselect',
    method: 'get',
  })
}

/**
 * 获取指定角色可用的菜单树结构数据。
 *
 * @param roleId - 角色的唯一标识符。
 * @returns 一个 Promise，解析为该角色可访问的菜单树形结构数据。
 */
export function roleMenuTreeSelect(roleId): Promise<any> {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get',
  })
}

/**
 * 创建一个新的菜单项。
 *
 * @param data - 包含菜单信息的数据对象。
 * @returns 一个 Promise，解析为新增菜单的响应结果。
 */
export function addMenu(data): Promise<any> {
  return request({
    url: '/system/menu',
    method: 'post',
    data,
  })
}

/**
 * 更新现有菜单的信息。
 *
 * @param data - 包含要更新菜单的详细信息。
 * @returns 一个 Promise，解析为接口返回的数据。
 */
export function updateMenu(data): Promise<any> {
  return request({
    url: '/system/menu',
    method: 'put',
    data,
  })
}

/**
 * 删除指定菜单。
 *
 * @param menuId - 要删除的菜单ID。
 * @returns 一个 Promise，解析为删除操作的响应结果。
 */
export function delMenu(menuId): Promise<any> {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete',
  })
}
