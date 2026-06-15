<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img alt="" v-if="logo" :src="logo" class="sidebar-logo rounded-50%" />
        <h1
          v-else
          class="sidebar-title"
          :style="{ color: getLogoTextColor }"
        >
          {{ title }}
        </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img alt="" v-if="logo" :src="logo" class="sidebar-logo rounded-full" />
        <h1 class="sidebar-title" :style="{ color: getLogoTextColor }">
          {{ title }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo/logo.png'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 58px;
  line-height: 58px;
  background: transparent;
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;

    & .sidebar-logo {
      display: inline-block;
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
      box-shadow: 0 10px 24px rgba(64, 158, 255, 0.18);
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 750;
      line-height: 58px;
      font-size: 14px;
      letter-spacing: 0.2px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
