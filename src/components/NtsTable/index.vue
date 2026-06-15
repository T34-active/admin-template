<script setup lang="ts">
import { ElTable } from 'element-plus/es'
import type { TableProps } from 'element-plus/es/components/table/src/table/defaults'

defineOptions({ name: 'ElTable', inheritAttrs: false })

const tableTooltipOptions: TableProps<Record<string, unknown>>['tooltipOptions'] = {
  appendTo: 'body',
  teleported: true,
  popperOptions: {
    strategy: 'fixed',
  },
}
</script>

<template>
  <ElTable v-bind="$attrs" :tooltip-options="tableTooltipOptions">
    <slot />
  </ElTable>
</template>
