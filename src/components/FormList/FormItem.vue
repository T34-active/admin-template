<script setup lang="ts">
import { disabledFutureDate, disabledPastDate } from '@/utils'
import type { PropType } from 'vue'
import { picUpload } from '@/utils/column'
import FormImagesUpload from '@/components/FormList/FormImagesUpload.vue'
import { useRegionStore } from '@/store/modules/region'

const regionStore = useRegionStore()

const props = defineProps({
  // v-model 绑定的值
  modelValue: {
    type: [String, Number, Array, Object, Boolean] as PropType<any>,
    default: null,
  },
  label: String,
  prop: String,
  // 组件类型
  type: {
    type: String,
    default: 'input',
  },
  placeholder: String,
  startPlaceholder: {
    type: String,
    default: '开始时间',
  },
  endPlaceholder: {
    type: String,
    default: '结束时间',
  },
  // 下拉选项
  dict: {
    type: Array as PropType<Array<{ label: string; value: string | number }>>,
    default: () => [],
  },
  maxlength: Number,
  limit: {
    type: Number,
    default: 1,
  },
  /** 禁用日期类型：future-禁用未来日期，past-禁用过去日期 */
  disabledDateType: {
    type: String,
    default: 'future',
  },
  /** 表单规则：支持全量 rules 对象或单个 rule 数组 */
  rules: {
    type: [Object, Array] as PropType<any>,
    default: () => ({}),
  },
  valueKey: String,
  /** --- 以下为上传组件所需业务参数 --- */
  documentType: String,
  documentName: String,
  merchantInfoId: String,
})

const emit = defineEmits(['update:modelValue', 'change', 'areaChange', 'clear'])

// 双向绑定逻辑
const innerValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

// 日期快捷选项：到期日期支持“长期”
const dateShortcuts = computed(() => {
  if (props.disabledDateType === 'past') {
    return [{ text: '长期', value: () => new Date(9999, 11, 31) }]
  }
  return []
})

// 根据类型选择日期禁用逻辑
const disabledDateFunction = computed(() => {
  return props.disabledDateType === 'past' ? disabledPastDate : disabledFutureDate
})

// 地区树
const regionTree = computed(() => regionStore.regions)

// 提取当前字段的校验规则
const ruleList = computed(() => {
  if (!props.rules) return []
  if (Array.isArray(props.rules)) return props.rules
  return props.rules[props.prop as string] || []
})

/** 事件处理 */
function handleChange(val: any) {
  emit('change', val)
}

function handleAreaChange(value: any) {
  if (!value || value.length === 0) return
  const [province, city, district] = value
  emit('areaChange', {
    province: province ? { code: province } : null,
    city: city ? { code: city } : null,
    district: district ? { code: district } : null,
  })
  emit('change', value)
}

function handleClear() {
  emit('clear')
}

onMounted(async () => {
  if (props.type === 'area') {
    await regionStore.loadRegions()
  }
})
</script>

<template>
  <el-form-item :label="label" :prop="prop" :rules="ruleList">
    <el-input
      v-if="type === 'input' || type === 'textarea'"
      v-model="innerValue"
      :type="type === 'textarea' ? 'textarea' : 'text'"
      :placeholder="placeholder || `请输入${label}`"
      :maxlength="maxlength"
      :rows="2"
      clearable
      @change="handleChange"
    />

    <el-select-v2
      v-if="type === 'select'"
      v-model="innerValue"
      :placeholder="placeholder || `请选择${label}`"
      :options="dict"
      :value-key="valueKey"
      clearable
      filterable
      @change="handleChange"
    />
    <el-radio-group v-if="type === 'radio'" v-model="innerValue" @change="handleChange">
      <el-radio v-for="item in dict" :key="item.value" :value="item.value">
        {{ item.label }}
      </el-radio>
    </el-radio-group>

    <el-date-picker
      v-if="type === 'date'"
      v-model="innerValue"
      type="date"
      value-format="YYYY-MM-DD"
      :placeholder="placeholder || `请选择${label}`"
      :disabled-date="disabledDateFunction"
      :shortcuts="dateShortcuts"
      clearable
      class="!w-full"
      @change="handleChange"
    />

    <el-date-picker
      v-if="type === 'daterange'"
      v-model="innerValue"
      type="daterange"
      value-format="YYYY-MM-DD"
      range-separator="-"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :disabled-date="disabledFutureDate"
      clearable
      @change="handleChange"
    />

    <el-cascader
      v-if="type === 'area'"
      v-model="innerValue"
      :options="regionTree"
      :placeholder="placeholder || `请选择${label}`"
      clearable
      filterable
      class="w-full"
      @change="handleAreaChange"
      @clear="handleClear"
    />

    <FormImagesUpload
      v-if="type === 'upload'"
      v-model="innerValue"
      :uploadImgUrl="picUpload"
      :file-size="5"
      :file-type="['jpg', 'png', 'jpeg']"
      :limit="limit"
      :document-name="documentName"
      :document-type="documentType"
      :merchantInfoId="merchantInfoId"
      @change="handleChange"
    />
  </el-form-item>
</template>

<style scoped lang="scss">
:deep(.el-input__wrapper),
:deep(.el-select-v2__wrapper),
:deep(.el-select__wrapper),
:deep(.el-cascader .el-input__wrapper),
:deep(.el-date-editor.el-input__wrapper) {
  border-radius: 14px;
  background: var(--input-bg);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select-v2__wrapper.is-focused),
:deep(.el-select__wrapper.is-focused),
:deep(.el-cascader .el-input__wrapper.is-focus),
:deep(.el-date-editor.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--current-color, var(--el-color-primary)) inset,
    0 0 0 3px var(--input-focus-ring);
}

:deep(.is-disabled .el-input__wrapper),
:deep(.is-disabled .el-select__wrapper),
:deep(.is-disabled .el-select-v2__wrapper),
:deep(.is-disabled .el-cascader .el-input__wrapper),
:deep(.is-disabled.el-date-editor .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
  background: var(--el-disabled-bg-color);
}

:deep(.el-date-editor) {
  width: 100%;
}
</style>
