<template>
  <i-frame v-model:src="url" />
</template>

<script setup lang="ts">
import iFrame from '@/components/iFrame/index.vue'

const url = ref(import.meta.env.VITE_APP_BASE_URL + '/druid/login.html')
</script>
