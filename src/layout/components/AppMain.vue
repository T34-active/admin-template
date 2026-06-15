<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component v-if="!route.meta.link" :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup lang="ts">
import iframeToggle from './IframeToggle/index.vue'
import useTagsViewStore from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  width: 100%;
  position: relative;
  padding: 16px;
  background: transparent;
}

.app-main :deep(.app-container) {
  border: 1px solid var(--layout-glass-border);
  border-radius: 24px;
  background: var(--page-card-bg);
  box-shadow: var(--layout-shadow);
}
</style>
