<template>
  <el-config-provider :locale="zhCn">
    <div
      :class="[classObj, { 'is-dark': settingsStore.isDark }]"
      class="app-wrapper"
      :style="{ '--current-color': theme }"
    >
      <div
        v-if="device === 'mobile' && sidebar.opened"
        class="drawer-bg"
        @click="handleClickOutside"
      />
      <sidebar v-if="!sidebar.hide" class="sidebar-container" />
      <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
        <div class="layout-header" :class="{ 'fixed-header': fixedHeader }">
          <navbar @setLayout="setLayout" />
          <tags-view v-if="needTagsView" />
        </div>
        <app-main />
        <settings ref="settingRef" />
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)
// const sideTheme = computed(() => settingsStore.sideTheme)
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}))

const { width, height } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watch(
  () => device.value,
  () => {
    if (device.value === 'mobile' && sidebar.value.opened) {
      useAppStore().closeSideBar({ withoutAnimation: false })
    }
  },
)

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    useAppStore().closeSideBar({ withoutAnimation: true })
  } else {
    useAppStore().toggleDevice('desktop')
  }
})

function handleClickOutside() {
  useAppStore().closeSideBar({ withoutAnimation: false })
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss' as mix;
@use '@/assets/styles/variables.module.scss' as vars;

.app-wrapper {
  @include mix.clearfix;
  position: relative;
  min-height: 100vh;
  width: 100%;
  background:
    radial-gradient(circle at 18% 18%, rgba(64, 158, 255, 0.16), transparent 30%),
    radial-gradient(circle at 84% 14%, rgba(103, 194, 58, 0.12), transparent 26%),
    linear-gradient(135deg, #eef5ff 0%, #f7fbff 45%, #eef7f4 100%);

  &::before,
  &::after {
    content: '';
    position: fixed;
    pointer-events: none;
    z-index: 0;
  }

  &::before {
    inset: 0;
    opacity: 0.36;
    background-image:
      linear-gradient(var(--layout-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--layout-grid) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, transparent, #000 16%, #000 72%, transparent);
  }

  &::after {
    right: 8%;
    top: 8%;
    width: 280px;
    height: 280px;
    border-radius: 999px;
    background: rgba(64, 158, 255, 0.12);
    filter: blur(14px);
  }

  &.is-dark {
    background:
      radial-gradient(circle at 20% 18%, rgba(37, 99, 235, 0.2), transparent 32%),
      radial-gradient(circle at 82% 12%, rgba(20, 184, 166, 0.1), transparent 28%),
      linear-gradient(135deg, #050816 0%, #0f172a 48%, #111827 100%);

    &::before {
      opacity: 0.22;
    }

    &::after {
      background: rgba(37, 99, 235, 0.1);
    }
  }

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.layout-header {
  position: relative;
  right: 0;
  z-index: 9;
  flex-shrink: 0;
  padding: 16px 16px 0;
  transition: width 0.28s;
}

.fixed-header {
  position: sticky;
  top: 0;
  //width: calc(100% - #{vars.$base-sidebar-width});
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}
</style>
