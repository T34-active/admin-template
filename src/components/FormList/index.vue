<script setup lang="ts">
import FormItem from '@/components/FormList/FormItem.vue'

/**
 * 类型定义：扩展了 full 和 half 属性
 */
export interface DictItem {
  label: string
  value: string | number
}

export interface FormItemConfig {
  label: string
  prop: string
  type?:
    | 'input'
    | 'select'
    | 'date'
    | 'daterange'
    | 'datetimerange'
    | 'radio'
    | 'textarea'
    | 'area'
    | 'upload'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  dict?: DictItem[]
  maxlength?: number
  limit?: number
  disabledDateType?: 'future' | 'past'
  valueKey?: string
  /** 布局控制 */
  full?: boolean // 强制占满一行 (span: 24)
  half?: boolean // 占据半行 (span: 12)
  /** 业务参数：用于上传组件 */
  documentType?: string
  documentName?: string
  merchantInfoId?: string
  /** 动态显示规则 */
  showWhen?: {
    field: string
    equals?: string | number
    notEquals?: string | number
    in?: Array<string | number>
    notIn?: Array<string | number>
    notNull?: boolean
  }
  /** 副作用钩子 */
  onEffect?: (val: any, model: any) => void
  rules?: any
}

export interface FormGroup {
  title: string
  items: FormItemConfig[]
}

const props = defineProps<{
  model: Record<string, any>
  items: FormGroup[]
  prop?: string
}>()

const emit = defineEmits(['update:model', 'change'])

const proxyModel = computed({
  get: () => props.model,
  set: (val) => emit('update:model', val),
})

function getFullProp(itemProp: string) {
  return props.prop ? `${props.prop}.${itemProp}` : itemProp
}

function shouldShow(item: FormItemConfig) {
  const rule = item.showWhen
  if (!rule) return true
  const current = proxyModel.value[rule.field]
  if (rule.notNull !== undefined) {
    if (current === null || current === undefined || current === '') return false
  }
  if (rule.equals !== undefined && current !== rule.equals) return false
  if (rule.notEquals !== undefined && current === rule.notEquals) return false
  if (rule.in && !rule.in.includes(current)) return false
  return !(rule.notIn && rule.notIn.includes(current))
}

function onItemChange(item: FormItemConfig, value: any) {
  console.log(item, value)
  if (item.onEffect) {
    item.onEffect(value, proxyModel.value)
  }
  emit('change', { field: item.prop, value, model: proxyModel.value })
}
</script>

<template>
  <el-row :gutter="10">
    <template v-for="(group, gIdx) in items" :key="gIdx">
      <colBox full>
        <div class="form-group-title">
          {{ group.title }}
        </div>
      </colBox>
      <template v-for="item in group.items" :key="item.prop">
        <colBox
          v-if="shouldShow(item)"
          :full="item.full || ['textarea', 'area'].includes(item.type!)"
          :half="item.half"
          class="px-2"
        >
          <FormItem
            v-model="proxyModel[item.prop!]"
            v-bind="item"
            :prop="getFullProp(item.prop!)"
            :rules="item.rules"
            :valueKey="item.valueKey"
            @change="(val) => onItemChange(item, val)"
            :merchantInfoId="proxyModel.merchantInfoId || item.merchantInfoId"
          />
        </colBox>
      </template>
    </template>
  </el-row>
</template>

<style scoped lang="scss">
.form-group-title {
  position: relative;
  margin-bottom: 16px;
  padding: 14px 16px 14px 18px;
  overflow: hidden;
  border: 1px solid var(--layout-glass-border);
  border-radius: 16px;
  color: var(--navbar-text);
  font-weight: 650;
  background: var(--layout-glass-bg);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    border-radius: 999px;
    background: var(--current-color, var(--el-color-primary));
  }
}
</style>
