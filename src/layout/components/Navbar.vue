<template>
  <div class="navbar flex justify-between items-center overflow-hidden h-50">
    <div class="flex items-center">
      <hamburger
        id="hamburger-container"
        :is-active="appStore.sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb
        v-if="!settingsStore.topNav"
        id="breadcrumb-container"
        class="breadcrumb-container"
      />
    </div>
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />
    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search
          id="header-search"
          class="right-menu-item hover-effect theme-switch-wrapper"
        />
        <screenfull id="screenfull" class="right-menu-item hover-effect theme-switch-wrapper" />

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect theme-switch-wrapper" />
        </el-tooltip>
      </template>

      <el-dropdown
        @command="handleCommand"
        class="avatar-container right-menu-item hover-effect"
        trigger="hover"
      >
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar mx-auto" alt="" />
          <span class="user-nickname">{{ userStore.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div
        class="right-menu-item hover-effect theme-switch-wrapper"
        @click="setLayout"
        v-if="settingsStore.showSettings"
      >
        <svg-icon icon-class="more-up" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import TopNav from '@/components/TopNav/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout()
      break
    case 'logout':
      logout()
      break
    default:
      break
  }
}

async function logout() {
  await ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await userStore.logOut()
  location.href = '/index'
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.navbar {
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  border: 1px solid var(--layout-glass-border);
  border-radius: 22px;
  box-shadow: var(--layout-shadow);
  backdrop-filter: blur(18px);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: var(--navbar-hover);
    }
  }
  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 8px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      min-width: 36px;
      height: 36px;
      font-size: 18px;
      color: var(--navbar-text);
      vertical-align: text-bottom;
      border-radius: 999px;
      transition:
        background 0.2s ease,
        transform 0.2s ease;

      &.hover-effect {
        cursor: pointer;

        &:hover {
          background: var(--navbar-hover);
          transform: translateY(-1px);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    .avatar-container {
      margin-right: 0;
      padding: 0 10px 0 8px;
      min-width: auto;
      border: 1px solid var(--layout-glass-border);
      background: var(--avatar-bg);

      .avatar-wrapper {
        right: auto;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        height: 100%;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid var(--avatar-border);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
        }

        .user-nickname {
          position: relative;
          left: auto;
          bottom: auto;
          font-size: 14px;
          font-weight: 650;
          color: var(--navbar-text);
          line-height: 1;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

</style>
