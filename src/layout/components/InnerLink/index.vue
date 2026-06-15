<template>
  <div :style="'height:' + height">
    <iframe :id="iframeId" :src="src" class="border-none size-full" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: '/',
  },
  iframeId: {
    type: String,
  },
})

const height = ref(document.documentElement.clientHeight - 94.5 + 'px')
</script>
