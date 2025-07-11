<template>
  <!-- 占位元素，动态高度 -->
  <div :style="{ height: `${height}px` }" />
  <!-- 底部固定栏 -->
  <div
    ref="footerRef"
    :style="{ width: appStore.sidebar.opened ? 'calc(100% - 200px)' : '' }"
    class="shadow-[0_-4px_10px_rgba(0,0,0,0.1)] fixed w-full bottom-0 right-0 bg-white z-990 transition-all duration-300"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()
// 绑定底部栏 DOM
const footerRef = ref<HTMLElement | null>(null)

// 动态获取 sidebar 宽度
const sidebarRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(0)

// 计算底部栏高度
const { height } = useElementSize(footerRef)

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
