import request from '@/utils/request'

/**
 * 获取定时任务调度的列表数据。
 *
 * @param query - 查询参数对象，用于筛选定时任务列表。
 * @returns 包含定时任务列表的 Promise。
 */
export function listJob(query): Promise<any> {
  return request({
    url: '/monitor/job/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定定时任务的详细信息。
 *
 * @param jobId - 定时任务的唯一标识符。
 * @returns 包含定时任务详细信息的 Promise。
 */
export function getJob(jobId): Promise<any> {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'get',
  })
}

/**
 * 创建新的定时任务调度。
 *
 * @param data - 包含定时任务配置信息的数据对象。
 * @returns 一个 Promise，解析为后端返回的响应结果。
 */
export function addJob(data): Promise<any> {
  return request({
    url: '/monitor/job',
    method: 'post',
    data,
  })
}

/**
 * 更新已有的定时任务信息。
 *
 * @param data - 包含要更新的定时任务详细信息的数据对象。
 * @returns 一个 Promise，解析为后端返回的更新结果。
 */
export function updateJob(data): Promise<any> {
  return request({
    url: '/monitor/job',
    method: 'put',
    data,
  })
}

/**
 * 删除指定的定时任务调度。
 *
 * @param jobId - 要删除的定时任务的唯一标识符。
 * @returns 一个 Promise，解析为删除操作的响应结果。
 */
export function delJob(jobId): Promise<any> {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'delete',
  })
}

/**
 * 修改指定定时任务的状态（如启用或停用）。
 *
 * @param jobId - 需要更改状态的定时任务ID。
 * @param status - 新的任务状态。
 * @returns 包含操作结果的 Promise。
 */
export function changeJobStatus(jobId, status): Promise<any> {
  const data = {
    jobId,
    status,
  }
  return request({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data,
  })
}

/**
 * 立即执行指定的定时任务一次。
 *
 * @param jobId - 定时任务的唯一标识符。
 * @param jobGroup - 定时任务所属的分组名称。
 * @returns 包含执行结果的 Promise。
 */
export function runJob(jobId, jobGroup): Promise<any> {
  const data = {
    jobId,
    jobGroup,
  }
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data,
  })
}
