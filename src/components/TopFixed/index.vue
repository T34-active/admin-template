<template>
  <!-- 占位元素，动态高度 -->
  <div :style="{ height: `${height}px` }" />
  <!-- 顶部固定栏 -->
  <div
    ref="topRef"
    :style="{
      top: topOffset + 'px',
      width:
        appStore.device === 'mobile'
          ? '100%'
          : appStore.sidebar.opened
            ? 'calc(100% - 216px)'
            : 'calc(100% - 70px)',
    }"
    class="top-fixed-bar fixed w-full right-0 z-30 transition-all duration-300 border border-[var(--layout-glass-border)] border-r-0 rounded-l-[20px] bg-[var(--layout-glass-bg)] shadow-[var(--layout-shadow)] backdrop-blur-[18px]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useElementSize, useWindowScroll } from '@vueuse/core'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()
const topRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(topRef)

const { y } = useWindowScroll()
const TRIGGER_SCROLL_TOP = 100
const topOffset = computed(() => (y.value >= TRIGGER_SCROLL_TOP ? 0 : 84))
</script>

