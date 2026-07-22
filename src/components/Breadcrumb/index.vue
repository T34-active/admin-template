<template>
  <el-breadcrumb
    class="inline-block text-14 leading-[50px] ml-8 py-0 px-12 rounded-full transition-[background] duration-200 hover:bg-[var(--navbar-hover)]"
    separator="/"
  >
    <transition-group name="breadcrumb" tag="div">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index === levelList.length - 1"
          class="text-[var(--tags-item-text)] cursor-text"
        >
          {{ item.meta.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const levelList = ref<any[]>([])

async function getBreadcrumb() {
  // only show routes with meta.title
  let matched: any = route.matched.filter((item) => item.meta && item.meta.title)
  const first = matched[0]
  // 判断是否为首页
  if (!isDashboard(first)) {
    matched = [{ path: '/index', meta: { title: '首页' } }].concat(matched)
  }
  levelList.value = matched.filter(
    (item: any) => item.meta && item.meta.title && item.meta.breadcrumb !== false,
  )
}

function isDashboard(route: any) {
  const name = route && route.name
  if (!name) {
    return false
  }
  return name.trim() === 'Index'
}

function handleLink(item: any) {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(path)
}

watchEffect(() => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (route.path.startsWith('/redirect/')) {
    return
  }
  getBreadcrumb()
})
onMounted(async () => {
  await getBreadcrumb()
})
</script>

<style scoped>
:deep(.el-breadcrumb__inner a),
:deep(.el-breadcrumb__inner.is-link) {
  color: var(--navbar-text);
  font-weight: 600;
}

:deep(.el-breadcrumb__separator) {
  color: var(--tags-item-text);
}
</style>
