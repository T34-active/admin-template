<template>
  <div id="tags-view-container" class="tags-view-container w-full">
    <scroll-pane
      ref="scrollPaneRef"
      class="tags-view-wrapper px-8 bg-white dark:bg-black"
      @scroll="handleScroll"
    >
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath } as any"
        class="tags-view-item inline-flex items-center rounded-md gap-x-2 shadow-xl"
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
      class="contextmenu flex flex-col shadow-2xl absolute text-xs text-primaryText font-medium bg-white dark:bg-black dark:text-white rounded-md py-4 z-3000 overflow-hidden"
    >
      <li
        @click="refreshSelectedTag(selectedTag)"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
      >
        <refresh-right class="size-12" />
        刷新页面
      </li>
      <li
        v-if="!isAffix(selectedTag)"
        @click="closeSelectedTag(selectedTag)"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
      >
        <close class="size-12" />
        关闭当前
      </li>
      <li
        @click="closeOthersTags"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
      >
        <circle-close class="size-12" />
        关闭其他
      </li>
      <li
        v-if="!isFirstView()"
        @click="closeLeftTags"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
      >
        <back class="size-12" />
        关闭左侧
      </li>
      <li
        v-if="!isLastView()"
        @click="closeRightTags"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
      >
        <right class="size-12" />
        关闭右侧
      </li>
      <li
        @click="closeAllTags(selectedTag)"
        class="flex items-center gap-x-2 hover:bg-surface dark:hover:bg-primaryText cursor-pointer"
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
function closeSelectedTag(view: any) {
  proxy.$tab.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}
function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then((visitedViews: any) => {
    if (!visitedViews.find((i: any) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}
function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then((visitedViews: any) => {
    if (!visitedViews.find((i: any) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}
function closeOthersTags() {
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
function openMenu(tag: any, e: any) {
  const menuMinWidth = 105
  const offsetLeft = proxy!.$el.getBoundingClientRect().left // container margin left
  const offsetWidth = proxy!.$el.offsetWidth // container width
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const l = e.clientX - offsetLeft + 15 // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
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
  height: 34px;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
  .tags-view-wrapper {
    .tags-view-item {
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &.active {
        @apply bg-primary border-primary;
        color: #fff;
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
    li {
      padding: 7px 16px;
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
        background-color: #b4bccc;
        color: #fff;
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}
</style>
