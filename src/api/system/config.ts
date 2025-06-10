import request from '@/utils/request'

/**
 * 获取系统配置参数列表。
 *
 * @param query - 查询条件对象，用于筛选配置参数列表。
 * @returns 包含配置参数列表的 Promise。
 */
export function listConfig(query): Promise<any> {
  return request({
    url: '/system/config/list',
    method: 'get',
    params: query,
  })
}

/**
 * 根据配置参数ID获取参数详细信息。
 *
 * @param configId - 配置参数的唯一标识符。
 * @returns 包含指定配置参数详细信息的 Promise。
 */
export function getConfig(configId): Promise<any> {
  return request({
    url: '/system/config/' + configId,
    method: 'get',
  })
}

/**
 * 根据参数键名获取对应的系统配置参数值。
 *
 * @param configKey - 配置参数的键名。
 * @returns 包含指定键名配置参数值的 Promise。
 */
export function getConfigKey(configKey): Promise<any> {
  return request({
    url: '/system/config/configKey/' + configKey,
    method: 'get',
  })
}

/**
 * 新增系统参数配置。
 *
 * @param data - 包含配置参数信息的数据对象。
 * @returns 一个 Promise，解析为新增配置参数的响应结果。
 */
export function addConfig(data): Promise<any> {
  return request({
    url: '/system/config',
    method: 'post',
    data,
  })
}

/**
 * 更新现有的系统参数配置信息。
 *
 * @param data - 包含需更新配置信息的数据对象。
 * @returns 一个 Promise，解析为接口返回的结果。
 */
export function updateConfig(data): Promise<any> {
  return request({
    url: '/system/config',
    method: 'put',
    data,
  })
}

/**
 * 删除指定的参数配置信息。
 *
 * @param configId - 要删除的参数配置ID。
 * @returns 删除操作的响应结果的 Promise。
 */
export function delConfig(configId): Promise<any> {
  return request({
    url: '/system/config/' + configId,
    method: 'delete',
  })
}

/**
 * 刷新系统参数缓存。
 *
 * @returns 一个 Promise，解析为刷新缓存操作的响应结果。
 */
export function refreshCache(): Promise<any> {
  return request({
    url: '/system/config/refreshCache',
    method: 'delete',
  })
}
