<template>
  <!-- 底部吸附栏，宽度跟随父容器 -->
  <div
    ref="footerRef"
    class="sticky bottom-0 z-30 w-full border border-[var(--layout-glass-border)] border-b-0 rounded-t-[20px] bg-[var(--layout-glass-bg)] shadow-[var(--layout-shadow)] backdrop-blur-[18px]"
  >
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

