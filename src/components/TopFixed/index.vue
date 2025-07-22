<template>
  <!-- 占位元素，动态高度 -->
  <div :style="{ height: `${height}px` }" />
  <!-- 底部固定栏 -->
  <div
    ref="topRef"
    :style="{ width: appStore.sidebar.opened ? 'calc(100% - 200px)' : '' }"
    class="fixed w-full top-84 right-0 z-30 transition-all duration-300 border-b shadow-xl bg-white dark:bg-black"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()
// 绑定底部栏 DOM
const topRef = ref<HTMLElement | null>(null)

// 动态获取 sidebar 宽度
const sidebarRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(0)

// 计算底部栏高度
const { height } = useElementSize(topRef)

onMounted(() => {
  sidebarRef.value = document.querySelector('.sidebar-container') as HTMLElement
  if (sidebarRef.value) {
    const { width } = useElementSize(sidebarRef)
    sidebarWidth.value = width.value

    // 监听宽度变化
    watch(width, (newWidth) => {
      sidebarWidth.value = newWidth
    })
  }
})
</script>
