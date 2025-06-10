import request from '@/utils/request'

/**
 * 获取符合查询条件的角色列表。
 *
 * @param query - 包含筛选条件的查询参数对象。
 * @returns 包含角色列表数据的 Promise。
 */
export function listRole(query): Promise<any> {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定角色的详细信息。
 *
 * @param roleId - 角色的唯一标识符。
 * @returns 包含角色详细信息的 Promise。
 */
export function getRole(roleId): Promise<any> {
  return request({
    url: '/system/role/' + roleId,
    method: 'get',
  })
}

/**
 * 创建一个新角色。
 *
 * @param data - 包含角色信息的数据对象。
 * @returns 包含新增角色结果的 Promise。
 */
export function addRole(data): Promise<any> {
  return request({
    url: '/system/role',
    method: 'post',
    data,
  })
}

/**
 * 更新指定的角色信息。
 *
 * @param data - 包含角色更新信息的对象。
 * @returns 包含更新结果的 Promise。
 */
export function updateRole(data): Promise<any> {
  return request({
    url: '/system/role',
    method: 'put',
    data,
  })
}

/**
 * 更新指定角色的数据权限范围。
 *
 * @param data - 包含角色标识及其数据权限设置信息的对象。
 * @returns 包含接口响应结果的 Promise。
 */
export function dataScope(data): Promise<any> {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data,
  })
}

/**
 * 修改指定角色的状态。
 *
 * @param roleId - 角色的唯一标识。
 * @param status - 要设置的角色状态值。
 * @returns 包含接口响应数据的 Promise。
 */
export function changeRoleStatus(roleId, status): Promise<any> {
  const data = {
    roleId,
    status,
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data,
  })
}

/**
 * 删除指定角色。
 *
 * @param roleId - 角色的唯一标识符。
 * @returns 包含删除结果的 Promise。
 */
export function delRole(roleId): Promise<any> {
  return request({
    url: '/system/role/' + roleId,
    method: 'delete',
  })
}

/**
 * 获取已分配角色的用户列表。
 *
 * @param query - 查询参数，用于筛选已授权用户。
 * @returns 包含已授权用户信息的 Promise。
 */
export function allocatedUserList(query): Promise<any> {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query,
  })
}

/**
 * 获取未被授权角色的用户列表。
 *
 * @param query - 查询参数，用于筛选未授权用户。
 * @returns 包含未授权用户信息的 Promise。
 */
export function unallocatedUserList(query): Promise<any> {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query,
  })
}

/**
 * 取消指定用户的角色授权。
 *
 * @param data - 包含用户和角色信息的对象，用于指定要取消授权的用户和角色。
 * @returns 一个 Promise，解析为接口返回的结果。
 */
export function authUserCancel(data): Promise<any> {
  return request({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data,
  })
}

/**
 * 批量取消用户的角色授权。
 *
 * @param data - 包含需要取消授权的用户和角色信息的参数对象。
 * @returns 包含批量取消授权操作结果的 Promise。
 */
export function authUserCancelAll(data): Promise<any> {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data,
  })
}

/**
 * 批量为角色授权用户。
 *
 * @param data - 包含授权用户信息的参数对象。
 * @returns 包含批量授权操作结果的 Promise。
 */
export function authUserSelectAll(data): Promise<any> {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data,
  })
}

/**
 * 获取指定角色的部门树结构信息。
 *
 * @param roleId - 角色的唯一标识符。
 * @returns 包含部门树结构的 Promise 对象。
 */
export function deptTreeSelect(roleId): Promise<any> {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get',
  })
}
