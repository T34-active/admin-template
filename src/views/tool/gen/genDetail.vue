<script setup lang="ts">
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
  if (pureName.endsWith('.sql')) return 'language-java'
  if (pureName.endsWith('.js') || pureName.endsWith('.vue')) return 'language-javascript'
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
onMounted(async () => {
  if (route.params.tableId) {
    await handlePreview(route.params.tableId)
    preview.value.title = route.query.tableComment
  }
})
</script>

<template>
  <div class="app-container">
    <div>{{ preview.title }}</div>
    <el-tabs v-model="preview.activeName">
      <el-tab-pane
        v-for="(value, key) in preview.data"
        :key="key"
        :label="getTabName(key)"
        :name="getTabName(key)"
      >
        <!-- 输出当前语言 class 供调试 -->
        <div class="text-xs text-gray-400 mb-1">{{ getLangClass(key) }}</div>
        <div class="flex justify-end items-center mb-2 lan">
          <el-link underline="always" v-copyText="value" v-copyText:callback="copyTextSuccess">
            <span class="inline-flex items-center gap-x-1">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </span>
          </el-link>
        </div>
        <div v-highlight>
          <pre><code :class="getLangClass(key)">{{ value }}</code></pre>
        </div>
      </el-tab-pane>
    </el-tabs>
    <BottomFixed>
      <div class="flex items-center justify-center p-4">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </BottomFixed>
  </div>
</template>

<style scoped lang="scss"></style>
