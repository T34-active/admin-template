import request from '@/utils/request'

/**
 * 获取公告列表。
 *
 * @param query - 查询参数，用于筛选公告列表。
 * @returns 包含公告列表数据的 Promise。
 */
export function listNotice(query): Promise<any> {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定公告的详细信息。
 *
 * @param noticeId - 公告的唯一标识符。
 * @returns 包含公告详细信息的 Promise。
 */
export function getNotice(noticeId): Promise<any> {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'get',
  })
}

/**
 * 创建新的公告。
 *
 * @param data - 包含公告内容的对象。
 * @returns 一个 Promise，解析为服务器返回的新增公告结果。
 */
export function addNotice(data): Promise<any> {
  return request({
    url: '/system/notice',
    method: 'post',
    data,
  })
}

/**
 * 更新现有公告的信息。
 *
 * @param data - 包含公告更新内容的对象。
 * @returns 一个 Promise，解析为服务器返回的更新结果。
 */
export function updateNotice(data): Promise<any> {
  return request({
    url: '/system/notice',
    method: 'put',
    data,
  })
}

/**
 * 删除指定的公告。
 *
 * @param noticeId - 公告的唯一标识符。
 * @returns 一个 Promise，解析为删除操作的服务器响应结果。
 */
export function delNotice(noticeId): Promise<any> {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'delete',
  })
}
