import request from '@/utils/request'

/**
 * 获取登录日志列表。
 *
 * @param query - 查询参数，用于筛选登录日志。
 * @returns 包含登录日志数据的 Promise。
 */
export function list(query): Promise<any> {
  return request({
    url: '/monitor/logininfor/list',
    method: 'get',
    params: query,
  })
}

/**
 * 删除指定的登录日志记录。
 *
 * @param infoId - 要删除的登录日志记录ID。
 * @returns 一个 Promise，解析为删除操作的结果。
 */
export function delLogininfor(infoId): Promise<any> {
  return request({
    url: '/monitor/logininfor/' + infoId,
    method: 'delete',
  })
}

/**
 * 解锁指定用户的登录状态。
 *
 * @param userName - 需要解锁登录状态的用户名。
 * @returns 一个 Promise，解析为接口返回的结果。
 */
export function unlockLogininfor(userName): Promise<any> {
  return request({
    url: '/monitor/logininfor/unlock/' + userName,
    method: 'get',
  })
}

/**
 * 清空所有登录日志记录。
 *
 * @returns 一个 Promise，解析为清空操作的结果。
 */
export function cleanLogininfor(): Promise<any> {
  return request({
    url: '/monitor/logininfor/clean',
    method: 'delete',
  })
}
