import { type Ref } from 'vue'
import { getCurrentInstance } from 'vue'

interface UsePageListOptions {
  /** ref 或 reactive 的查询参数对象 */
  queryParams: Ref<Record<string, any>> | Record<string, any>
  /** 列表查询 API（返回 { rows, total }） */
  listApi: (params: any) => Promise<any>
  /** 日期区间字段名，默认 'dateRange'，设为 '' 可禁用日期处理 */
  dateRangeProp?: string
  /** 表单 ref 名称，用于重置表单，默认 'queryRef' */
  formRefName?: string
}

/**
 * 通用列表页 composable
 *
 * 封装：
 * - list / loading / total / ids / multiple / showSearch 响应式状态
 * - getList —— 自动处理 safeRange + addDateRange + pagination
 * - handleQuery —— 重置 pageNum + 调用 getList
 * - resetQuery —— 重置日期区间 + 重置表单 + 调用 handleQuery
 * - handleSelectionChange —— 标准多选逻辑
 *
 * 不封装：delete / export / detail（各页面差异较大）
 *
 * @example 直接 reactive
 *   const queryParams = reactive({ pageNum: 1, ... })
 *   const { list, ... } = usePageList({ queryParams, listApi })
 *
 * @example toRefs
 *   const { queryParams } = toRefs(data)
 *   const { list, ... } = usePageList({ queryParams, listApi })
 */
export function usePageList(options: UsePageListOptions) {
  const { proxy } = getCurrentInstance()
  const { listApi, dateRangeProp = 'dateRange', formRefName = 'queryRef' } = options

  /** 获取参数对象 — 兼容 Ref 和 reactive */
  function paramsObj(): Record<string, any> {
    return unref(options.queryParams)
  }

  const list = ref<any[]>([])
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref<string[]>([])
  const multiple = ref(true)
  const total = ref(0)

  function buildSafeRange(): [Date | string | undefined, Date | string | undefined] {
    if (!dateRangeProp) return [undefined, undefined]
    const dateRange = paramsObj()[dateRangeProp]
    return Array.isArray(dateRange) && dateRange.length === 2
      ? [dateRange[0] ?? undefined, dateRange[1] ?? undefined]
      : [undefined, undefined]
  }

  async function getList() {
    loading.value = true
    const obj = paramsObj()
    const params = dateRangeProp ? proxy.addDateRange({ ...obj }, buildSafeRange()) : { ...obj }
    const response = await listApi(params)
    loading.value = false
    list.value = response.rows ?? []
    total.value = response.total ?? 0
  }

  function handleQuery() {
    paramsObj().pageNum = 1
    getList()
  }

  function resetQuery() {
    if (dateRangeProp) {
      paramsObj()[dateRangeProp] = [null, null]
    }
    proxy.resetForm(formRefName)
    handleQuery()
  }

  function handleSelectionChange(selection: any[]) {
    ids.value = selection.map((item) => item.id)
    multiple.value = !selection.length
  }

  return {
    list,
    loading,
    total,
    ids,
    multiple,
    showSearch,
    getList,
    handleQuery,
    resetQuery,
    handleSelectionChange,
  }
}
