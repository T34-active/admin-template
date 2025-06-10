import request from '@/utils/request'

/**
 * 获取部门列表。
 *
 * @param query - 查询参数，用于筛选部门列表。
 * @returns 包含部门列表的 Promise。
 */
export function listDept(query): Promise<any> {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取排除指定部门及其子节点的部门列表。
 *
 * @param deptId - 需要排除的部门节点ID。
 * @returns 包含排除指定节点及其子节点后的部门列表的 Promise。
 */
export function listDeptExcludeChild(deptId): Promise<any> {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get',
  })
}

/**
 * 获取指定部门的详细信息。
 *
 * @param deptId - 部门的唯一标识符。
 * @returns 包含部门详细信息的 Promise。
 */
export function getDept(deptId): Promise<any> {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get',
  })
}

/**
 * 创建一个新的部门。
 *
 * @param data - 包含部门信息的数据对象。
 * @returns 一个 Promise，解析为新增部门的响应结果。
 */
export function addDept(data): Promise<any> {
  return request({
    url: '/system/dept',
    method: 'post',
    data,
  })
}

/**
 * 更新指定部门的信息。
 *
 * @param data - 包含要更新的部门详细信息的数据对象。
 * @returns 一个 Promise，解析为更新操作的响应结果。
 */
export function updateDept(data): Promise<any> {
  return request({
    url: '/system/dept',
    method: 'put',
    data,
  })
}

/**
 * 删除指定部门及其相关信息。
 *
 * @param deptId - 需要删除的部门ID。
 * @returns 请求删除操作的响应结果的 Promise。
 */
export function delDept(deptId): Promise<any> {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete',
  })
}
