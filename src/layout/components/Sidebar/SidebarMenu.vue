<script setup lang="ts">
import SidebarMenuItem from './SidebarMenuItem.vue'
import { collectOpenKeys, resolveChildBasePath, resolveSidebarItem, type SidebarRoute } from './useSidebarMenu'

const props = defineProps({
  routes: {
    type: Array as () => SidebarRoute[],
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  activeMenu: {
    type: String,
    default: '',
  },
  uniqueOpened: {
    type: Boolean,
    default: true,
  },
})

const openKeys = ref<string[]>([])

function getRootKey(path: string) {
  for (const route of props.routes) {
    const nodePath = resolveChildBasePath('', route.path)
    const resolved = resolveSidebarItem(route, nodePath)
    if (resolved && (path === resolved.path || path.startsWith(`${resolved.path}/`))) {
      return resolved.path
    }
  }
  return path
}

function syncOpenKeys() {
  openKeys.value = collectOpenKeys(props.routes, props.activeMenu)
}

watch(
  () => [props.routes, props.activeMenu],
  () => {
    syncOpenKeys()
  },
  { immediate: true, deep: true },
)

function handleToggle(key: string) {
  if (openKeys.value.includes(key)) {
    openKeys.value = openKeys.value.filter((item) => item !== key && !item.startsWith(`${key}/`))
    return
  }

  const ancestors = openKeys.value.filter((item) => key.startsWith(`${item}/`))
  let nextKeys = [...ancestors, key]

  if (props.uniqueOpened) {
    const rootKey = getRootKey(key)
    nextKeys = nextKeys.filter((item) => getRootKey(item) === rootKey)
  }

  openKeys.value = nextKeys
}
</script>

<template>
  <ul class="nts-sidebar-menu" :class="{ 'nts-sidebar-menu--collapsed': collapsed }">
    <sidebar-menu-item
      v-for="(route, index) in routes"
      :key="route.path + index"
      :item="route"
      :base-path="resolveChildBasePath('', route.path)"
      :level="1"
      :collapsed="collapsed"
      :active-menu="activeMenu"
      :open-keys="openKeys"
      :unique-opened="uniqueOpened"
      @toggle="handleToggle"
    />
  </ul>
</template>
