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
    class="top-fixed-bar fixed w-full right-0 z-30 transition-all duration-300"
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

<style scoped lang="scss">
.top-fixed-bar {
  border: 1px solid var(--layout-glass-border);
  border-right: 0;
  border-radius: 20px 0 0 20px;
  background: var(--layout-glass-bg);
  box-shadow: var(--layout-shadow);
  backdrop-filter: blur(18px);
}
</style>
