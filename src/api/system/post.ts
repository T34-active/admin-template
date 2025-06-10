import request from '@/utils/request'

/**
 * 获取岗位列表。
 *
 * @param query - 查询参数，用于筛选岗位列表。
 * @returns 包含岗位列表数据的 Promise。
 */
export function listPost(query): Promise<any> {
  return request({
    url: '/system/post/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定岗位的详细信息。
 *
 * @param postId - 岗位的唯一标识符。
 * @returns 包含岗位详细信息的 Promise。
 */
export function getPost(postId): Promise<any> {
  return request({
    url: '/system/post/' + postId,
    method: 'get',
  })
}

/**
 * 创建一个新的岗位。
 *
 * @param data - 包含岗位信息的数据对象。
 * @returns 一个 Promise，解析为服务器返回的响应结果。
 */
export function addPost(data): Promise<any> {
  return request({
    url: '/system/post',
    method: 'post',
    data,
  })
}

/**
 * 更新现有岗位的信息。
 *
 * @param data - 包含岗位更新信息的对象。
 * @returns 一个 Promise，解析为服务器返回的响应数据。
 */
export function updatePost(data): Promise<any> {
  return request({
    url: '/system/post',
    method: 'put',
    data,
  })
}

/**
 * 删除指定的岗位。
 *
 * @param postId - 要删除的岗位ID。
 * @returns 一个 Promise，解析为服务器的响应结果。
 */
export function delPost(postId): Promise<any> {
  return request({
    url: '/system/post/' + postId,
    method: 'delete',
  })
}
