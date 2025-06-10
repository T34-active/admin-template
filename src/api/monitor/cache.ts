import request from '@/utils/request'

/**
 * 获取缓存的详细信息。
 *
 * @returns 一个 Promise，解析为缓存的详细数据。
 */
export function getCache(): Promise<any> {
  return request({
    url: '/monitor/cache',
    method: 'get',
  })
}

/**
 * 获取所有缓存名称的列表。
 *
 * @returns 一个 Promise，解析为包含所有缓存名称的响应数据。
 */
export function listCacheName(): Promise<any> {
  return request({
    url: '/monitor/cache/getNames',
    method: 'get',
  })
}

/**
 * 获取指定缓存名称下的所有缓存键名列表。
 *
 * @param cacheName - 要查询的缓存名称。
 * @returns 包含该缓存名称下所有键名的 Promise。
 */
export function listCacheKey(cacheName): Promise<any> {
  return request({
    url: '/monitor/cache/getKeys/' + cacheName,
    method: 'get',
  })
}

/**
 * 获取指定缓存名称和键对应的缓存值。
 *
 * @param cacheName - 缓存名称。
 * @param cacheKey - 缓存键。
 * @returns 包含指定缓存项值的 Promise。
 */
export function getCacheValue(cacheName, cacheKey): Promise<any> {
  return request({
    url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
    method: 'get',
  })
}

/**
 * 清除指定名称的缓存条目。
 *
 * @param cacheName - 要清除的缓存名称。
 * @returns 一个 Promise，解析为接口返回的数据。
 */
export function clearCacheName(cacheName): Promise<any> {
  return request({
    url: '/monitor/cache/clearCacheName/' + cacheName,
    method: 'delete',
  })
}

/**
 * 清除指定缓存键对应的缓存数据。
 *
 * @param cacheKey - 要清除的缓存键名。
 * @returns 一个 Promise，解析为接口返回的数据。
 */
export function clearCacheKey(cacheKey): Promise<any> {
  return request({
    url: '/monitor/cache/clearCacheKey/' + cacheKey,
    method: 'delete',
  })
}

/**
 * 清除所有缓存条目。
 *
 * @returns 一个 Promise，解析为清理操作的响应结果。
 */
export function clearCacheAll(): Promise<any> {
  return request({
    url: '/monitor/cache/clearCacheAll',
    method: 'delete',
  })
}
