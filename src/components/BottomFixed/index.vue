<template>
  <!-- 底部吸附栏，宽度跟随父容器 -->
  <div ref="footerRef" class="bottom-fixed-bar sticky bottom-0 z-30 w-full">
    <slot />
  </div>
  <!-- 占位元素，避免吸附状态遮挡底部内容 -->
  <!--  <div :style="{ height: `${height}px` }" />-->
</template>

<script setup lang="ts">
// import { useElementSize } from '@vueuse/core'

const footerRef = ref<HTMLElement | null>(null)
// const { height } = useElementSize(footerRef)
</script>

<style scoped lang="scss">
.bottom-fixed-bar {
  border: 1px solid var(--layout-glass-border);
  border-bottom: 0;
  border-radius: 20px 20px 0 0;
  background: var(--layout-glass-bg);
  box-shadow: var(--layout-shadow);
  backdrop-filter: blur(18px);
}
</style>
