import dayjs from 'dayjs'

interface DictItem {
  label: string
  value: string | number
}
/**
 * 使用 dayjs 格式化时间
 * @param time 输入时间，可以是时间戳、字符串或 Date 对象
 * @param pattern 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
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

// 字符串格式化(%s )
// export function sprintf(str: string) {
//   // eslint-disable-next-line prefer-rest-params
//   const args = arguments
//   let flag = true
//   let i = 1
//   str = str.replace(/%s/g, function () {
//     const arg = args[i++]
//     if (typeof arg === 'undefined') {
//       flag = false
//       return ''
//     }
//     return arg
//   })
//   return flag ? str : ''
// }

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str: string) {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return str
}

// // 数据合并
// export function mergeRecursive(source, target) {
//     for (var p in target) {
//         try {
//             if (target[p].constructor===Object) {
//                 source[p] = mergeRecursive(source[p], target[p]);
//             } else {
//                 source[p] = target[p];
//             }
//         } catch (e) {
//             source[p] = target[p];
//         }
//     }
//     return source;
// }

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
