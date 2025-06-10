import request from '@/utils/request'

/**
 * 获取生成表的数据列表。
 *
 * @param query - 查询参数对象，用于筛选生成表数据。
 * @returns 包含生成表数据列表的 Promise。
 */
export function listTable(query): Promise<any> {
  return request({
    url: '/tool/gen/list',
    method: 'get',
    params: query,
  })
}
/**
 * 获取数据库表的列表信息。
 *
 * @param query - 查询参数，用于筛选数据库表。
 * @returns 包含数据库表列表的 Promise。
 */
export function listDbTable(query): Promise<any> {
  return request({
    url: '/tool/gen/db/list',
    method: 'get',
    params: query,
  })
}

/**
 * 获取指定表的详细信息。
 *
 * @param tableId - 需要查询的表的唯一标识。
 * @returns 包含表详细信息的 Promise。
 */
export function getGenTable(tableId): Promise<any> {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'get',
  })
}

/**
 * 更新代码生成配置信息。
 *
 * @param data - 包含要更新的代码生成配置信息的数据对象。
 * @returns 一个 Promise，解析为后端返回的更新结果。
 */
export function updateGenTable(data): Promise<any> {
  return request({
    url: '/tool/gen',
    method: 'put',
    data,
  })
}

/**
 * 向后端导入指定的表信息。
 *
 * @param data - 包含要导入表的相关参数。
 * @returns 一个 Promise，解析为导入操作的响应结果。
 */
export function importTable(data): Promise<any> {
  return request({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data,
  })
}

/**
 * 向后端发送请求以创建新表。
 *
 * @param data - 包含新表信息的参数对象。
 * @returns 一个 Promise，解析为创建表操作的响应结果。
 */
export function createTable(data): Promise<any> {
  return request({
    url: '/tool/gen/createTable',
    method: 'post',
    params: data,
  })
}

/**
 * 获取指定表的代码生成预览结果。
 *
 * @param tableId - 需要预览代码的表的唯一标识。
 * @returns 包含生成代码预览内容的 Promise。
 */
export function previewTable(tableId): Promise<any> {
  return request({
    url: '/tool/gen/preview/' + tableId,
    method: 'get',
  })
}

/**
 * 删除指定的表数据。
 *
 * @param tableId - 要删除的表的唯一标识。
 * @returns 一个 Promise，解析为删除操作的响应结果。
 */
export function delTable(tableId): Promise<any> {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete',
  })
}

/**
 * 为指定表名生成代码并支持自定义路径。
 *
 * @param tableName - 需要生成代码的数据表名称。
 * @returns 包含生成结果的 Promise。
 */
export function genCode(tableName): Promise<any> {
  return request({
    url: '/tool/gen/genCode/' + tableName,
    method: 'get',
  })
}

/**
 * 同步指定数据表的数据库结构。
 *
 * @param tableName - 要同步的表名。
 * @returns 一个 Promise，解析为同步操作的响应结果。
 */
export function synchDb(tableName): Promise<any> {
  return request({
    url: '/tool/gen/synchDb/' + tableName,
    method: 'get',
  })
}
