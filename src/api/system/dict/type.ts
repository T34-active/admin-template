import request from '@/utils/request'

/**
 * 获取字典类型列表。
 *
 * @param query - 查询参数对象，用于筛选字典类型列表。
 * @returns 包含字典类型列表的 Promise。
 */
export function listType(query): Promise<any> {
  return request({
    url: '/system/dict/type/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定字典类型的详细信息。
 *
 * @param dictId - 字典类型的唯一标识符。
 * @returns 一个 Promise，解析为该字典类型的详细信息。
 */
export function getType(dictId): Promise<any> {
  return request({
    url: '/system/dict/type/' + dictId,
    method: 'get',
  })
}

/**
 * 创建新的字典类型。
 *
 * @param data - 包含字典类型信息的数据对象。
 * @returns 新增字典类型的请求结果。
 */
export function addType(data): Promise<any> {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data,
  })
}

/**
 * 更新现有的字典类型信息。
 *
 * @param data - 包含要更新的字典类型详细信息的数据对象。
 * @returns 返回一个 Promise，解析为接口响应结果。
 */
export function updateType(data): Promise<any> {
  return request({
    url: '/system/dict/type',
    method: 'put',
    data,
  })
}

/**
 * 删除指定 ID 的字典类型。
 *
 * @param dictId - 字典类型的唯一标识符。
 * @returns 包含删除结果的 Promise。
 */
export function delType(dictId): Promise<any> {
  return request({
    url: '/system/dict/type/' + dictId,
    method: 'delete',
  })
}

/**
 * 刷新字典类型的缓存数据。
 *
 * @returns 一个 Promise，解析为缓存刷新操作的结果。
 */
export function refreshCache(): Promise<any> {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete',
  })
}

/**
 * 获取用于下拉选择框的字典类型列表。
 *
 * @returns 包含可选字典类型的 Promise。
 */
export function optionselect(): Promise<any> {
  return request({
    url: '/system/dict/type/optionselect',
    method: 'get',
  })
}
