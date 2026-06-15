<template>
  <el-col v-bind="colProps">
    <slot />
  </el-col>
</template>

<script setup lang="ts">
const props = defineProps<{
  full?: boolean
  half?: boolean
}>()

/**
 * 定义两种布局方案
 */
const fullLayout = {
  span: 24,
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 24,
}

const defaultLayout = {
  span: 8,
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
}

const halfLayout = {
  span: 12,
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
}

/**
 * 根据属性计算最终布局
 */
const colProps = computed(() => {
  if (props.full) return fullLayout
  if (props.half) return halfLayout
  return defaultLayout
})
</script>
