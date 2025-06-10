import request from '@/utils/request'

/**
 * 获取在线用户列表。
 *
 * @param query - 查询参数，用于筛选在线用户。
 * @returns 包含在线用户列表的 Promise。
 */
export function list(query): Promise<any> {
  return request({
    url: '/monitor/online/list',
    method: 'get',
    params: query,
  })
}

/**
 * 强制使指定 tokenId 的用户下线。
 *
 * @param tokenId - 要强制下线的用户令牌 ID。
 * @returns 包含操作结果的 Promise。
 */
export function forceLogout(tokenId): Promise<any> {
  return request({
    url: '/monitor/online/' + tokenId,
    method: 'delete',
  })
}
