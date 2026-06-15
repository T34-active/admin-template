<template>
  <div id="tags-view-container" class="tags-view-container w-full">
    <scroll-pane
      ref="scrollPaneRef"
      class="tags-view-wrapper px-8 overflow-hidden"
      @scroll="handleScroll"
    >
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath } as any"
        class="tags-view-item inline-flex items-center gap-x-2"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <close />
        </el-icon>
      </router-link>
    </scroll-pane>
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu tags-view-contextmenu flex flex-col absolute text-xs font-medium py-4 z-3000 overflow-hidden"
    >
      <li
        @click="refreshSelectedTag(selectedTag)"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <refresh-right class="size-12" />
        刷新页面
      </li>
      <li
        v-if="!isAffix(selectedTag)"
        @click="closeSelectedTag(selectedTag)"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <close class="size-12" />
        关闭当前
      </li>
      <li
        @click="closeOthersTags"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <circle-close class="size-12" />
        关闭其他
      </li>
      <li
        v-if="!isFirstView()"
        @click="closeLeftTags"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <back class="size-12" />
        关闭左侧
      </li>
      <li
        v-if="!isLastView()"
        @click="closeRightTags"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <right class="size-12" />
        关闭右侧
      </li>
      <li
        @click="closeAllTags(selectedTag)"
        class="flex items-center gap-x-2 cursor-pointer"
      >
        <circle-close class="size-12" />
        全部关闭
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import ScrollPane from './ScrollPane.vue'
import { getNormalPath } from '@/utils/ruoyi'
import useTagsViewStore from '@/store/modules/tagsView'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({
  fullPath: null,
})
const affixTags = ref([])
const scrollPaneRef = ref(null)

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => useSettingsStore().theme)

watch(route, () => {
  addTags()
  moveToCurrentTag()
})
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})
onMounted(() => {
  initTags()
  addTags()
})

function isActive(r: any) {
  return r.path === route.path
}
function activeStyle(tag: any) {
  if (!isActive(tag)) return {}
  return {
    'background-color': theme.value,
    'border-color': theme.value,
  }
}
function isAffix(tag: any) {
  return tag.meta && tag.meta.affix
}
function isFirstView() {
  try {
    return (
      selectedTag.value.fullPath === '/index' ||
      selectedTag.value.fullPath === visitedViews.value[1].fullPath
    )
  } catch (err) {
    return false
  }
}
function isLastView() {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
  } catch (err) {
    return false
  }
}
function filterAffixTags(routes: any[], basePath = '') {
  let tags: any[] = []
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}
function initTags() {
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag)
    }
  }
}
function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
    if (route.meta.link) {
      useTagsViewStore().addIframeView(route)
    }
  }
  return false
}
function moveToCurrentTag() {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value!.moveToTarget(r)
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route)
        }
      }
    }
  })
}
function refreshSelectedTag(view: any) {
  proxy.$tab.refreshPage(view)
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}
async function closeSelectedTag(view: any) {
  const { visitedViews } = await proxy.$tab.closePage(view)
  if (isActive(view)) {
    toLastView(visitedViews, view)
  }
}
async function closeRightTags() {
  const visitedViews = await proxy.$tab.closeRightPage(selectedTag.value)
  if (!visitedViews.find((item) => item.fullPath === route.fullPath)) {
    toLastView(visitedViews)
  }
}
async function closeLeftTags() {
  const visitedViews = await proxy.$tab.closeLeftPage(selectedTag.value)
  if (!visitedViews.find((item) => item.fullPath === route.fullPath)) {
    toLastView(visitedViews)
  }
}
async function closeOthersTags() {
  router.push(selectedTag.value).catch((e) => {
    console.log(e)
  })
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}
function closeAllTags(view: any) {
  proxy.$tab.closeAllPage().then(({ visitedViews }: any) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}
function toLastView(visitedViews: any, view?: any) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}
function openMenu(tag: any, e: MouseEvent) {
  const menuMinWidth = 128
  const container = proxy!.$el as HTMLElement
  const { left: containerLeft, top: containerTop, width: containerWidth } =
    container.getBoundingClientRect()
  const maxLeft = containerWidth - menuMinWidth
  const l = e.clientX - containerLeft + 4

  left.value = l > maxLeft ? maxLeft : l
  top.value = e.clientY - containerTop + 4
  visible.value = true
  selectedTag.value = tag
}
function closeMenu() {
  visible.value = false
}
function handleScroll() {
  closeMenu()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  position: relative;
  height: 42px;
  margin-top: 10px;
  border: 1px solid var(--layout-glass-border);
  border-radius: 18px;
  background: var(--tags-bg);
  box-shadow: var(--layout-shadow);
  backdrop-filter: blur(18px);

  .tags-view-wrapper {
    .tags-view-item {
      height: 30px;
      line-height: 30px;
      border: 1px solid var(--tags-item-border);
      border-radius: 999px;
      color: var(--tags-item-text);
      background: var(--tags-item-bg);
      padding: 0 12px;
      font-size: 12px;
      margin-left: 6px;
      margin-top: 5px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        background: var(--tags-item-hover);
        transform: translateY(-1px);
      }

      &.active {
        @apply bg-primary border-primary;
        color: #fff;
        box-shadow: 0 12px 26px color-mix(in srgb, var(--current-color) 28%, transparent);

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    min-width: 128px;
    border: 1px solid var(--layout-glass-border);
    border-radius: 16px;
    color: var(--navbar-text);
    background: var(--layout-glass-bg);
    box-shadow: var(--layout-shadow);
    backdrop-filter: blur(18px);

    li {
      padding: 7px 16px;
      transition: background 0.2s ease;

      &:hover {
        background: var(--tags-item-hover);
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: var(--tags-close-hover);
        color: var(--navbar-text);
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}
</style>
