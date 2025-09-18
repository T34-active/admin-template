<template>
  <el-col
    :span="full ? 24 : 8"
    :xs="full ? 24 : 24"
    :sm="full ? 24 : 12"
    :md="full ? 24 : 12"
    :lg="full ? 24 : 12"
    :xl="full ? 24 : 8"
  >
    <slot />
  </el-col>
</template>

<script setup lang="ts">
defineProps<{
  full?: boolean
}>()
</script>
