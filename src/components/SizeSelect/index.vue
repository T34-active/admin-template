<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div class="size-icon--style">
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item of sizeOptions"
          :key="item.value"
          :disabled="size === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import useAppStore from '@/store/modules/app'
import { sizeOptions } from '@/utils/column'
const appStore = useAppStore()
const size = computed(() => appStore.size)
const { proxy } = getCurrentInstance()

function handleSetSize(size) {
  proxy.$modal.loading('正在设置布局大小，请稍候...')
  appStore.setSize(size)
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>

<style lang="scss" scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>
