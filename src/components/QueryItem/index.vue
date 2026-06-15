<script setup lang="ts">
import { defaultTime, disabledFutureDate } from '@/utils'
import type { PropType } from 'vue'
type ModelValueType = string | number | boolean | Record<string, any> | [string, string]
const props = defineProps({
  // v-model 绑定的值，根据组件类型不同而变化
  // 对于日期范围选择器，它应该是一个包含两个日期字符串的数组
  modelValue: {
    type: [String, Number, Object, Boolean, Array] as PropType<ModelValueType>,
    default: null,
  },
  // 表单项的标签文字
  label: String,
  // 表单项对应的字段名，用于表单验证等
  prop: String,
  // 组件类型，默认是 input，可选 input/select/daterange/radio/datetimerange
  type: {
    type: String,
    default: 'input',
  },
  // 输入框或选择框的占位提示文字
  placeholder: String,
  // 日期范围选择器的开始日期占位文字
  startPlaceholder: {
    type: String,
    default: '开始时间',
  },
  // 日期范围选择器的结束日期占位文字
  endPlaceholder: {
    type: String,
    default: '结束时间',
  },
  // 下拉选项的数据数组，元素包含 label 和 value 字段
  dict: {
    type: Array as PropType<Array<{ label: string; value: string | number }>>,
    default: () => [{ label: '请在字典管理进行生成', value: 0 }],
  },
  /** 最大输入长度 */
  maxlength: {
    type: Number,
    default: null,
  },
})

// 定义事件：支持 v-model 的 update:modelValue 事件和自定义 change 事件
const emit = defineEmits(['update:modelValue', 'change'])

// 定义一个计算属性 innerValue，用于实现 v-model 双向绑定
// get 时读取 props.modelValue，set 时触发 update:modelValue 和 change 事件
const innerValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    // 向父组件发送更新事件，通知 v-model 绑定的值发生变化
    emit('update:modelValue', val)
    // 发送自定义 change 事件，父组件可监听执行额外逻辑
    emit('change', val)
  },
})
</script>

<template>
  <colBox>
    <el-form-item :label="label" :prop="prop">
      <!-- 输入框类型 -->
      <el-input
        v-if="type === 'input' || type === 'textarea'"
        :type="type === 'textarea' ? 'textarea' : 'input'"
        v-model="innerValue"
        :placeholder="placeholder || `请输入${label}`"
        :maxlength="maxlength || null"
        :rows="2"
        clearable
      />
      <!-- 下拉选择类型 -->
      <el-select-v2
        v-if="type === 'select'"
        v-model="innerValue"
        :placeholder="placeholder || `请选择${label}`"
        :options="dict"
        clearable
        filterable
      />
      <!-- 日期范围选择 -->
      <el-date-picker
        v-if="type === 'daterange'"
        v-model="innerValue"
        type="daterange"
        :default-time="defaultTime()"
        value-format="YYYY-MM-DD"
        range-separator="-"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        :disabled-date="disabledFutureDate"
        clearable
      />
      <!-- 日期时间范围选择 -->
      <el-date-picker
        v-if="type === 'datetimerange'"
        v-model="innerValue"
        type="datetimerange"
        :default-time="defaultTime()"
        value-format="YYYY-MM-DD HH:mm:ss"
        range-separator="-"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        :disabled-date="disabledFutureDate"
        clearable
      />
      <!-- 单选框 -->
      <el-radio-group v-if="type === 'radio'" v-model="innerValue">
        <el-radio v-for="dict in dict || []" :key="dict.value" :value="dict.value">
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </colBox>
</template>

<style scoped lang="scss">
:deep(.el-input__wrapper),
:deep(.el-select-v2__wrapper),
:deep(.el-select__wrapper),
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
:deep(.el-date-editor.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--current-color, var(--el-color-primary)) inset,
    0 0 0 3px var(--input-focus-ring);
}

:deep(.is-disabled .el-input__wrapper),
:deep(.is-disabled .el-select__wrapper),
:deep(.is-disabled .el-select-v2__wrapper),
:deep(.is-disabled.el-date-editor .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
  background: var(--el-disabled-bg-color);
}
</style>
