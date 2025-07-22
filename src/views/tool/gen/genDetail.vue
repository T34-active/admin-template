<script setup lang="ts">
import TopFixed from '@/components/TopFixed/index.vue'
import { previewTable } from '@/api/tool/gen'
const { proxy } = getCurrentInstance()
const route = proxy.$route
const preview = ref({
  open: false,
  title: '代码预览',
  data: {},
  activeName: 'domain.java',
})
function getTabName(path: string): string {
  const start = path.lastIndexOf('/') + 1
  const end = path.indexOf('.vm')
  if (start === -1 || end === -1 || end <= start) return path
  return path.substring(start, end)
}

function getLangClass(fileName: string): string {
  // 去掉 .vm 后缀再处理
  const pureName = fileName.replace(/\.vm$/, '').toLowerCase()
  if (pureName.endsWith('.java')) return 'language-java'
  if (pureName.endsWith('.xml')) return 'language-xml'
  if (pureName.endsWith('sql')) return 'language-sql'
  if (pureName.endsWith('.js') || pureName.endsWith('.vue')) return 'language-javascript'
  if (pureName.endsWith('.ts')) return 'language-typescript'
  return 'language-plaintext'
}
/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess('复制成功')
}
/** 预览按钮 */
async function handlePreview(tableId: number) {
  const response = await previewTable(tableId)
  preview.value.data = response.data
  preview.value.open = true
  preview.value.activeName = 'domain.java'
}

/** 返回按钮操作 */
function handleClose() {
  const obj = { path: '/tool/gen' }
  proxy.$tab.closeOpenPage(obj)
}

// 获取当前激活 tab 的 key
const activeKey = computed(() => {
  return Object.keys(preview.value.data).find((key) => getTabName(key) === preview.value.activeName)
})
onMounted(async () => {
  if (route.params.tableId) {
    await handlePreview(route.params.tableId)
    preview.value.title = route.query.tableComment
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 吸顶部分 -->
    <TopFixed>
      <div class="container mx-auto">
        <div class="flex flex-col justify-start px-16 py-12">
          <!-- 吸顶标题和 tabs -->
          <div class="text-xl font-bold mb-2 text-center">{{ preview.title }}</div>
          <el-tabs v-model="preview.activeName">
            <el-tab-pane
              v-for="(value, key) in preview.data"
              :key="key"
              :label="getTabName(key)"
              :name="getTabName(key)"
            />
          </el-tabs>

          <!-- 只显示当前 tab 的复制区域 -->
          <template v-if="preview.data[activeKey]">
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-400 mb-1">{{ getLangClass(activeKey) }}</div>
              <div class="flex justify-end items-center mb-2 lan">
                <el-link
                  underline="always"
                  v-copyText="preview.data[activeKey]"
                  v-copyText:callback="copyTextSuccess"
                >
                  <span class="inline-flex items-center gap-x-4">
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </span>
                </el-link>
              </div>
            </div>
          </template>
        </div>
      </div>
    </TopFixed>

    <!-- tab 内容区域 -->
    <div
      v-for="(value, key) in preview.data"
      :key="key"
      v-show="preview.activeName === getTabName(key)"
    >
      <div v-highlight>
        <pre><code :class="getLangClass(key)">{{ value }}</code></pre>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <BottomFixed>
      <div class="flex items-center justify-center p-16">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </BottomFixed>
  </div>
</template>
