<template>
  <QueryItem
    v-for="item in items"
    :key="item.prop"
    :label="item.label"
    :prop="item.prop"
    :type="item.type"
    :placeholder="item.placeholder"
    :start-placeholder="item.startPlaceholder"
    :end-placeholder="item.endPlaceholder"
    :dict="item.dict"
    :maxlength="item.maxlength"
    v-model="proxyModel[item.prop]"
    @input="(val) => handleItemInput(item, val)"
    @commit="(val) => handleItemCommit(item, val)"
  />
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
/**
 * QueryForm.vue
 * @description 用于动态渲染多个查询表单项组件 <QueryItem />，支持 input、select、daterange 类型。
 *              根据传入的 items 配置数组，生成相应的表单输入项，并绑定到 model 对象中。
 *
 * @prop {Record<string, any>} model - 查询表单绑定的数据对象，需使用 reactive 传入。
 * @prop {QueryItemConfig[]} items - 查询项的配置数组，每项包含控件类型、label、字段名等。
 *
 * QueryItemConfig:
 * @typedef {Object} QueryItemConfig
 * @property {string} label - 表单项标签
 * @property {string} prop - 表单字段 key，对应 model 中字段
 * @property {'input' | 'select' | 'daterange' | 'datetimerange' | 'radio'} type - 控件类型
 * @property {string} [placeholder] - 输入框占位提示
 * @property {string} [startPlaceholder] - daterange 的起始占位
 * @property {string} [endPlaceholder] - daterange 的结束占位
 * @property {DictItem[]} [dict] - 下拉选择的字典项（仅 select 使用）
 *
 * DictItem:
 * @typedef {Object} DictItem
 * @property {string} label - 显示文本
 * @property {string | number} value - 实际值
 *
 * @usage 示例用法：
 * <QueryForm :model="formModel" :items="queryItems" @search="handleQuery" />
 *
 * const formModel = reactive({ keyword: '', gender: '', timeRange: [] });
 * const queryItems = [
 *   { label: '关键词', prop: 'keyword', type: 'input', placeholder: '请输入关键词' },
 *   { label: '性别', prop: 'gender', type: 'select', dict: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
 *   { label: '时间范围', prop: 'timeRange', type: 'daterange', startPlaceholder: '开始时间', endPlaceholder: '结束时间' }
 * ]
 */
import QueryItem from '@/components/QueryItem/index.vue' // 引入通用查询项组件

// 定义下拉选项（字典）结构
export interface DictItem {
  label?: string
  value?: string | number
}

// 定义每个查询项配置的结构
export interface QueryItemConfig {
  label?: string // 显示的标签
  prop?: string // 表单字段名，对应 model 的属性
  type?: 'input' | 'select' | 'daterange' | 'datetimerange' | 'radio' | 'checkbox' // 控件类型
  placeholder?: string // 控件的占位文字
  startPlaceholder?: string // daterange 的开始占位符
  endPlaceholder?: string // daterange 的结束占位符
  dict?: DictItem[] | Ref<DictItem[]> // 允许传 ref // 下拉列表项，只有 select 类型用到
  maxlength?: number // 最大输入长度
  /** 输入框自动查询防抖时间；设为 0 表示仅回车或清空时查询 */
  debounce?: number
}

export interface QueryFormEvent {
  prop?: string
  value: unknown
  type?: QueryItemConfig['type']
}

const DEFAULT_INPUT_DEBOUNCE = 400

// 接收父组件传入的 model 数据和查询项配置数组
const props = defineProps<{
  model: Record<string, any> // 表单绑定的数据对象（通过 v-model 传入）
  items: QueryItemConfig[] // 表单项配置数组（定义需要渲染哪些查询项）
}>()
// 新增 computed 代理
const proxyModel = computed({
  get: () => props.model,
  set: (val) => emit('update:model', val),
})
// input：模型输入；commit：明确提交；change/search：兼容现有列表页的查询触发事件
const emit = defineEmits<{
  'update:model': [value: Record<string, any>]
  input: [event: QueryFormEvent]
  commit: [event: QueryFormEvent]
  reset: []
  change: [event: QueryFormEvent]
  search: [event: QueryFormEvent]
}>()

const inputTimers = new Map<string, ReturnType<typeof setTimeout>>()

function eventOf(item: QueryItemConfig, value: unknown): QueryFormEvent {
  return { prop: item.prop, value, type: item.type }
}

function clearInputTimer(prop?: string) {
  const key = prop || ''
  const timer = inputTimers.get(key)
  if (timer) {
    clearTimeout(timer)
    inputTimers.delete(key)
  }
}

function emitSearch(event: QueryFormEvent) {
  emit('change', event)
  emit('search', event)
}

function handleItemInput(item: QueryItemConfig, value: unknown) {
  const event = eventOf(item, value)
  emit('input', event)
  if (item.type !== 'input') return

  clearInputTimer(item.prop)
  const delay = item.debounce ?? DEFAULT_INPUT_DEBOUNCE
  if (delay <= 0) return

  const key = item.prop || ''
  inputTimers.set(
    key,
    setTimeout(() => {
      inputTimers.delete(key)
      emitSearch(event)
    }, delay),
  )
}

function handleItemCommit(item: QueryItemConfig, value: unknown) {
  clearInputTimer(item.prop)
  const event = eventOf(item, value)
  emit('commit', event)
  emitSearch(event)
}

function notifyReset() {
  inputTimers.forEach((timer) => clearTimeout(timer))
  inputTimers.clear()
  emit('reset')
}

onBeforeUnmount(() => {
  inputTimers.forEach((timer) => clearTimeout(timer))
  inputTimers.clear()
})

defineExpose({ notifyReset })
</script>
