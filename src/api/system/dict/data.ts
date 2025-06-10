import request from '@/utils/request'

/**
 * 获取字典数据列表。
 *
 * @param query - 查询参数对象，用于筛选字典数据。
 * @returns 包含字典数据列表的 Promise。
 */
export function listData(query): Promise<any> {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query,
  })
}

/**
 * 根据字典编码获取对应的字典数据信息。
 *
 * @param dictCode - 字典数据的唯一编码。
 * @returns 包含指定字典数据详情的 Promise。
 */
export function getData(dictCode): Promise<any> {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get',
  })
}

/**
 * 根据指定的字典类型获取对应的字典数据列表。
 *
 * @param dictType - 字典类型标识，用于筛选字典数据。
 * @returns 包含指定类型字典数据的 Promise。
 */
export function getDicts(dictType): Promise<any> {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get',
  })
}

/**
 * 创建新的字典数据条目。
 *
 * @param data - 包含要新增字典数据的详细信息。
 * @returns 一个 Promise，解析为接口返回的结果。
 */
export function addData(data): Promise<any> {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data,
  })
}

/**
 * 更新现有的字典数据项。
 *
 * @param data - 包含要更新的字典数据内容。
 * @returns 一个 Promise，解析为接口返回的更新结果。
 */
export function updateData(data): Promise<any> {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data,
  })
}

/**
 * 根据字典编码删除对应的字典数据项。
 *
 * @param dictCode - 要删除的数据项的字典编码。
 * @returns 一个 Promise，解析为接口返回的删除结果。
 */
export function delData(dictCode): Promise<any> {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete',
  })
}
