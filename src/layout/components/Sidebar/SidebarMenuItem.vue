<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import AppLink from './Link.vue'
import {
  hasActiveDescendant,
  isActivePath,
  resolveChildBasePath,
  resolveSidebarItem,
  type SidebarRoute,
} from './useSidebarMenu'

const props = defineProps({
  item: {
    type: Object as () => SidebarRoute,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  inPopover: {
    type: Boolean,
    default: false,
  },
  activeMenu: {
    type: String,
    default: '',
  },
  openKeys: {
    type: Array as () => string[],
    default: () => [],
  },
  uniqueOpened: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits<{
  toggle: [key: string]
}>()

const popoverVisible = ref(false)
const resolved = computed(() => resolveSidebarItem(props.item, props.basePath))

const showLabel = computed(() => !props.collapsed || props.inPopover)
const isOpen = computed(() => !!resolved.value && props.openKeys.includes(resolved.value.path))
const isLeafActive = computed(
  () => resolved.value?.type === 'leaf' && isActivePath(resolved.value.path, props.activeMenu),
)
const isBranchActive = computed(() => {
  if (!resolved.value || resolved.value.type !== 'branch') {
    return false
  }
  return hasActiveDescendant(resolved.value.children, props.activeMenu, props.basePath)
})

function handleToggle() {
  if (!resolved.value || resolved.value.type !== 'branch') {
    return
  }
  if (props.collapsed && !props.inPopover) {
    popoverVisible.value = !popoverVisible.value
    return
  }
  emit('toggle', resolved.value.path)
}
</script>

<template>
  <template v-if="resolved">
    <li
      v-if="resolved.type === 'leaf'"
      class="nts-sidebar-menu__item"
      :class="[
        `nts-sidebar-menu__item--level-${level}`,
        { 'is-active': isLeafActive, 'is-collapsed': collapsed && !inPopover },
      ]"
    >
      <el-tooltip
        :content="resolved.title"
        placement="right"
        :disabled="showLabel || !resolved.title"
        :show-after="300"
      >
        <app-link
          :to="resolved.to"
          class="nts-sidebar-menu__link"
          :class="{ 'is-active': isLeafActive }"
          @click="popoverVisible = false"
        >
          <span class="nts-sidebar-menu__icon" aria-hidden="true">
            <svg-icon v-if="resolved.icon" :icon-class="resolved.icon" />
          </span>
          <span v-if="showLabel" class="nts-sidebar-menu__label" :title="resolved.title">
            {{ resolved.title }}
          </span>
        </app-link>
      </el-tooltip>
    </li>

    <li
      v-else
      class="nts-sidebar-menu__item nts-sidebar-menu__item--branch"
      :class="[
        `nts-sidebar-menu__item--level-${level}`,
        {
          'is-open': isOpen,
          'is-active': isBranchActive,
          'is-collapsed': collapsed && !inPopover,
        },
      ]"
    >
      <el-popover
        v-if="collapsed && !inPopover"
        v-model:visible="popoverVisible"
        placement="right-start"
        :width="220"
        trigger="click"
        popper-class="nts-sidebar-menu__popover"
        :show-arrow="false"
        :offset="8"
      >
        <template #reference>
          <button
            type="button"
            class="nts-sidebar-menu__trigger"
            :class="{ 'is-active': isBranchActive }"
            @click="handleToggle"
          >
            <span class="nts-sidebar-menu__icon" aria-hidden="true">
              <svg-icon v-if="resolved.icon" :icon-class="resolved.icon" />
            </span>
          </button>
        </template>
        <ul class="nts-sidebar-menu nts-sidebar-menu--popover">
          <sidebar-menu-item
            v-for="child in resolved.children"
            :key="child.path"
            :item="child"
            :base-path="resolveChildBasePath(basePath, child.path)"
            :level="1"
            :collapsed="false"
            :in-popover="true"
            :active-menu="activeMenu"
            :open-keys="openKeys"
            :unique-opened="uniqueOpened"
            @toggle="emit('toggle', $event)"
          />
        </ul>
      </el-popover>

      <template v-else>
        <button
          type="button"
          class="nts-sidebar-menu__trigger"
          :class="{ 'is-active': isBranchActive }"
          @click="handleToggle"
        >
          <span class="nts-sidebar-menu__icon" aria-hidden="true">
            <svg-icon v-if="resolved.icon" :icon-class="resolved.icon" />
          </span>
          <span v-if="showLabel" class="nts-sidebar-menu__label" :title="resolved.title">
            {{ resolved.title }}
          </span>
          <el-icon v-if="showLabel" class="nts-sidebar-menu__arrow" :class="{ 'is-open': isOpen }">
            <ArrowDown />
          </el-icon>
        </button>

        <ul v-show="isOpen" class="nts-sidebar-menu__children">
          <sidebar-menu-item
            v-for="child in resolved.children"
            :key="child.path"
            :item="child"
            :base-path="resolveChildBasePath(basePath, child.path)"
            :level="level + 1"
            :collapsed="collapsed"
            :active-menu="activeMenu"
            :open-keys="openKeys"
            :unique-opened="uniqueOpened"
            @toggle="emit('toggle', $event)"
          />
        </ul>
      </template>
    </li>
  </template>
</template>

<script lang="ts">
export default {
  name: 'SidebarMenuItem',
}
</script>
