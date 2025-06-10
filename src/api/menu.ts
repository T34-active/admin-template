import request from '@/utils/request'

/**
 * 获取后端提供的路由配置信息。
 *
 * @returns 一个 Promise，解析为从后端获取的路由配置数据。
 */
export function getRouters(): Promise<any> {
  return request({
    url: '/getRouters',
    method: 'get',
  })
}
