<template>
  <!-- 占位元素，动态高度 -->
  <div :style="{ height: `${height}px` }" />
  <!-- 底部固定栏 -->
  <div
    ref="topRef"
    :style="{
      top: topOffset + 'px',
      width: appStore.sidebar.opened ? 'calc(100% - 200px)' : '',
    }"
    class="fixed w-full top-84 right-0 z-30 transition-all duration-300 border-b shadow-xl bg-white dark:bg-black"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useElementSize, useWindowScroll } from '@vueuse/core'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()
// 绑定底部栏 DOM
const topRef = ref<HTMLElement | null>(null)

// 动态获取 sidebar 宽度
const sidebarRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(0)

// 计算底部栏高度
const { height } = useElementSize(topRef)

// 监听滚动
const { y } = useWindowScroll()

// 滚动阈值，超过后吸顶
const TRIGGER_SCROLL_TOP = 100

// 计算 top 偏移
const topOffset = computed(() => {
  return y.value >= TRIGGER_SCROLL_TOP ? 0 : 84
})

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
