import dayjs from 'dayjs'

interface DictItem {
  label: string
  value: string | number
}
/**
 * 使用 dayjs 格式化时间
 * @param time 输入时间，可以是时间戳、字符串或 Date 对象
 * @param pattern 格式化模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的时间字符串或 null
 */
export function parseTime(
  time: string | number | Date,
  pattern: string = 'YYYY-MM-DD',
): string | null {
  if (!time) return null
  // 处理秒级时间戳（10位）
  if (typeof time === 'number' && time.toString().length === 10) {
    time = time * 1000
  }
  const date = dayjs(time)
  if (!date.isValid()) return null
  return date.format(pattern)
}

/**
 * 重置 Element-Plus 表单（Composition API）
 * @param refName 通过 `ref` 获取到的表单实例
 */
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

/**
 * 向请求参数中添加日期范围（平级输出）
 * @param params 原始参数对象
 * @param dateRange 日期范围数组 [开始时间, 结束时间]
 * @param propName 属性名（可选，默认为 beginTime/endTime）
 */
export function upDateAddDateRange(
  params: Record<string, any>,
  dateRange: [Date | string | undefined, Date | string | undefined] = [undefined, undefined],
  propName?: string,
) {
  const [begin, end] = dateRange
  const result = { ...params }
  // 删除不需要的字段
  delete result.dateRange
  // 平铺 notParams 中的字段（如果存在）
  if (result.notParams && typeof result.notParams === 'object') {
    Object.assign(result, result.notParams)
    delete result.notParams
  }
  // 设置平级的日期字段
  if (!propName) {
    result.beginTime = begin
    result.endTime = end
  } else {
    result[`begin${propName}`] = begin
    result[`end${propName}`] = end
  }
  return result
}

/**
 * 向请求参数中添加日期范围
 * @param params 原始参数对象
 * @param dateRange 日期范围数组，最多两个时间（开始和结束）
 * @param propName 属性名（可选，默认为 beginTime/endTime）
 */
export function addDateRange(
  params: Record<string, any>,
  dateRange: [Date | string | undefined, Date | string | undefined] = [undefined, undefined],
  propName?: string,
) {
  const [begin, end] = dateRange
  const result = { ...params }
  // 删除 dateRange 字段，避免传递给后端
  delete result.dateRange
  result.params =
    typeof result.params === 'object' && result.params !== null && !Array.isArray(result.params)
      ? { ...result.params }
      : {}
  if (!propName) {
    result.params.beginTime = begin
    result.params.endTime = end
  } else {
    result.params[`begin${propName}`] = begin
    result.params[`end${propName}`] = end
  }
  return result
}

/**
 * 批量向请求参数中添加所有区间范围字段
 * 约定所有区间字段格式为 [begin, end]
 * 会自动识别如 createdAt, updatedAt, dateRange 等区间字段
 * 并在 params 下生成对应的 beginXxx、endXxx 字段
 */
export function addAllDateRanges(
  params: Record<string, any>,
  propNameMap?: Record<string, string>,
) {
  const result = { ...params }
  result.params =
    typeof result.params === 'object' && result.params !== null && !Array.isArray(result.params)
      ? { ...result.params }
      : {}
  // 默认需要处理的字段
  const keys = Object.keys(result).filter(
    (key) =>
      Array.isArray(result[key]) &&
      result[key].length === 2 &&
      (result[key][0] !== undefined || result[key][1] !== undefined),
  )
  for (const key of keys) {
    const [begin, end] = result[key]
    // 支持传入 propNameMap 做映射，比如 { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' }
    const finalKey = propNameMap?.[key] || key.charAt(0).toUpperCase() + key.slice(1)
    result.params[`begin${finalKey}`] = begin
    result.params[`end${finalKey}`] = end
    delete result[key] // 删除原始区间字段，避免冗余
  }
  return result
}

/**
 * 回显数据字典（单个值）
 * @param datas 数据字典数组
 * @param value 要查找的值
 */
export function selectDictLabel(datas: DictItem[], value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const match = datas.find((item) => item.value === String(value))
  return match ? match.label : String(value)
}

/**
 * 回显数据字典（多个值，用分隔符连接）
 * @param datas 数据字典数组
 * @param value 字符串数组、字符串或以分隔符连接的字符串
 * @param separator 分隔符，默认是逗号
 */
export function selectDictLabels(
  datas: DictItem[],
  value: string | string[] | undefined,
  separator: string = ',',
): string {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return ''
  }
  const values = Array.isArray(value) ? value : value.split(separator)
  const result = values.map((val) => {
    const match = datas.find((item) => item.value === val || item.value === String(val))
    return match ? match.label : val
  })
  return result.join(separator)
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str: string) {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return str
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data: any[], id?: string, parentId?: string, children?: string) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  }

  const childrenListMap: Record<string, any[]> = {}
  const nodeIds: Record<string, any> = {}
  const tree: any[] = []

  // 构建 childrenListMap 和 nodeIds 映射
  for (const d of data) {
    const pid = d[config.parentId]
    if (!childrenListMap[pid]) {
      childrenListMap[pid] = []
    }
    childrenListMap[pid].push(d)
    nodeIds[d[config.id]] = d
  }

  // 根节点：没有 parentId 或 parentId 不在 nodeIds 中
  for (const d of data) {
    const pid = d[config.parentId]
    if (!nodeIds[pid]) {
      tree.push(d)
    }
  }

  // 递归设置 children
  function adaptToChildrenList(node: any) {
    const id = node[config.id]
    if (childrenListMap[id]) {
      node[config.childrenList] = childrenListMap[id]
      for (const child of node[config.childrenList]) {
        adaptToChildrenList(child)
      }
    }
  }

  for (const root of tree) {
    adaptToChildrenList(root)
  }

  return tree
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

// 返回项目路径
export function getNormalPath(p: any) {
  if (p.length === 0 || !p || p === 'undefined') {
    return p
  }
  const res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res
}

// 验证是否为blob格式
export function blobValidate(data: any) {
  return data.type !== 'application/json'
}
