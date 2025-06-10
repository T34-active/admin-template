import request from '@/utils/request'

/**
 * 获取调度日志列表。
 *
 * @param query - 查询条件，用于筛选调度日志。
 * @returns 包含调度日志列表的 Promise。
 */
export function listJobLog(query): Promise<any> {
  return request({
    url: '/monitor/jobLog/list',
    method: 'get',
    params: query,
  })
}

/**
 * 删除指定的调度日志。
 *
 * @param jobLogId - 要删除的调度日志的唯一标识。
 * @returns 一个 Promise，解析为服务器返回的删除结果。
 */
export function delJobLog(jobLogId): Promise<any> {
  return request({
    url: '/monitor/jobLog/' + jobLogId,
    method: 'delete',
  })
}

/**
 * 清空所有调度日志。
 *
 * @returns 一个 Promise，解析为服务器响应结果。
 */
export function cleanJobLog(): Promise<any> {
  return request({
    url: '/monitor/jobLog/clean',
    method: 'delete',
  })
}
