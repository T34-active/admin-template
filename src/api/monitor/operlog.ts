import request from '@/utils/request'

/**
 * 获取符合查询条件的操作日志列表。
 *
 * @param query - 查询条件对象，用于筛选操作日志。
 * @returns 包含操作日志列表的 Promise。
 */
export function list(query): Promise<any> {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query,
  })
}

/**
 * 删除指定的操作日志。
 *
 * @param operId - 要删除的操作日志ID。
 * @returns 服务端返回的删除结果。
 */
export function delOperlog(operId): Promise<any> {
  return request({
    url: '/monitor/operlog/' + operId,
    method: 'delete',
  })
}

/**
 * 清空所有操作日志。
 *
 * @returns 服务端响应的 Promise。
 */
export function cleanOperlog(): Promise<any> {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete',
  })
}
