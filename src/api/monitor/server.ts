import request from '@/utils/request'

/**
 * 获取服务器的监控信息。
 *
 * @returns 返回一个包含服务器监控数据的 Promise。
 */
export function getServer(): Promise<any> {
  return request({
    url: '/monitor/server',
    method: 'get',
  })
}
