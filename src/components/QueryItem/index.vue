<script setup lang="ts">
import { defaultTime, disabledFutureDate } from '@/utils'

const props = defineProps({
  // v-model 绑定的值，可以是多种类型（字符串、数字、数组、对象、布尔）
  modelValue: [String, Number, Array, Object, Boolean],
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
    default: () => '开始时间',
  },
  // 日期范围选择器的结束日期占位文字
  endPlaceholder: {
    type: String,
    default: () => '结束时间',
  },
  // 下拉选项的数据数组，元素包含 label 和 value 字段
  dict: {
    type: Array as () => Array<{ label: string; value: string | number }>,
    default: () => [],
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

// 子组件内部调用，用于处理各个控件触发的变化事件
// val 是最新值，直接赋给 innerValue 触发 set 方法，进而触发事件上抛
// function handleQuery(val) {
//   innerValue.value = val
// }
</script>

<template>
  <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
    <el-form-item :label="label" :prop="prop">
      <!-- 输入框类型 -->
      <el-input
        v-if="type === 'input'"
        v-model="innerValue as string | number"
        :placeholder="placeholder"
        clearable
      />
      <!-- 下拉选择类型 -->
      <el-select
        v-if="type === 'select'"
        v-model="innerValue as string | number | Array<string | number>"
        :placeholder="placeholder"
        clearable
        filterable
      >
        <el-option
          v-for="item in dict || []"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <!-- 日期范围选择 -->
      <el-date-picker
        v-if="type === 'daterange'"
        v-model="innerValue as [string, string]"
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
        v-model="innerValue as [string, string]"
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
      <el-radio-group v-if="type === 'radio'" v-model="innerValue as string | number | boolean">
        <el-radio v-for="dict in dict || []" :key="dict.value" :value="dict.value">
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-col>
</template>
