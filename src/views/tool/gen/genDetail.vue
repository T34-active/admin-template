<script setup lang="ts">
import { previewTable } from '@/api/tool/gen'

const { proxy } = getCurrentInstance()
const route = proxy.$route

const loading = ref(true)
const preview = ref({
  title: '代码预览',
  data: {} as Record<string, string>,
  activeName: 'domain.java',
})

interface PreviewFile {
  key: string
  name: string
  ext: string
  langClass: string
  langLabel: string
  content: string
  lines: number
}

function getTabName(path: string): string {
  const start = path.lastIndexOf('/') + 1
  const end = path.indexOf('.vm')
  if (start === -1 || end === -1 || end <= start) return path
  return path.substring(start, end)
}

function getLangClass(fileName: string): string {
  const pureName = fileName.replace(/\.vm$/, '').toLowerCase()
  if (pureName.endsWith('.java')) return 'language-java'
  if (pureName.endsWith('.xml')) return 'language-xml'
  if (pureName.endsWith('sql')) return 'language-sql'
  if (pureName.endsWith('.vue')) return 'language-typescript'
  if (pureName.endsWith('.ts') || pureName.endsWith('.js')) return 'language-typescript'
  return 'language-plaintext'
}

function getLangLabel(langClass: string): string {
  const map: Record<string, string> = {
    'language-java': 'Java',
    'language-xml': 'XML',
    'language-sql': 'SQL',
    'language-typescript': 'TypeScript',
    'language-plaintext': 'Plain Text',
  }
  return map[langClass] || 'Code'
}

function getFileExt(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > -1 ? name.slice(dot + 1) : 'file'
}

function getExtDotClass(ext: string, active: boolean): string {
  const colorMap: Record<string, string> = {
    java: 'bg-[#e76f51]',
    xml: 'bg-[#f4a261]',
    sql: 'bg-[#2a9d8f]',
    ts: 'bg-[#42a5f5]',
    vue: 'bg-[#42a5f5]',
  }
  const color = colorMap[ext] || 'bg-[var(--el-text-color-placeholder)]'
  return active ? `${color} shadow-[0_0_0_3px_rgba(64,158,255,0.18)]` : color
}

const files = computed<PreviewFile[]>(() =>
  Object.entries(preview.value.data).map(([key, content]) => {
    const name = getTabName(key)
    const langClass = getLangClass(key)
    return {
      key,
      name,
      ext: getFileExt(name),
      langClass,
      langLabel: getLangLabel(langClass),
      content,
      lines: content ? content.split('\n').length : 0,
    }
  }),
)

const activeFile = computed(
  () => files.value.find((file) => file.name === preview.value.activeName) ?? files.value[0],
)

function copyTextSuccess() {
  proxy.$modal.msgSuccess('复制成功')
}

async function loadPreview(tableId: number | string) {
  loading.value = true
  try {
    const response = await previewTable(tableId)
    preview.value.data = response.data
    const firstFile = Object.keys(response.data)[0]
    preview.value.activeName = firstFile ? getTabName(firstFile) : 'domain.java'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  proxy.$tab.closeOpenPage({ path: '/tool/gen' })
}

function selectFile(name: string) {
  preview.value.activeName = name
}

onMounted(async () => {
  if (route.params.tableId) {
    preview.value.title = (route.query.tableComment as string) || '代码预览'
    await loadPreview(route.params.tableId)
  } else {
    loading.value = false
  }
})
</script>

<template>
  <div class="app-container flex min-h-[calc(100vh-132px)] flex-col overflow-hidden !p-0">
    <div v-loading="loading" class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        class="flex flex-col items-start justify-between gap-16 border-b border-[var(--el-border-color-lighter)] bg-[var(--app-surface-soft)] px-20 py-[18px] md:flex-row md:items-center"
      >
        <div class="flex min-w-0 items-center gap-16">
          <el-button class="shrink-0 !pl-0 font-semibold" link type="primary" @click="handleClose">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <div class="min-w-0">
            <span class="mb-4 block text-xs text-[var(--el-text-color-secondary)]">
              代码生成预览
            </span>
            <h1
              class="m-0 truncate text-lg font-bold leading-[1.35] text-[var(--el-text-color-primary)] md:whitespace-nowrap"
            >
              {{ preview.title }}
            </h1>
          </div>
        </div>
        <div
          class="flex w-full shrink-0 items-center justify-between gap-12 md:w-auto md:justify-start"
        >
          <el-tag effect="plain" round>{{ files.length }} 个文件</el-tag>
          <el-button
            v-if="activeFile"
            type="primary"
            plain
            v-copyText="activeFile.content"
            v-copyText:callback="copyTextSuccess"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制当前文件
          </el-button>
        </div>
      </header>

      <nav
        v-if="files.length"
        class="flex gap-8 overflow-x-auto border-b border-[var(--el-border-color-lighter)] bg-[var(--page-card-bg)] px-16 py-12"
        aria-label="生成文件列表"
      >
        <button
          v-for="file in files"
          :key="file.key"
          type="button"
          class="inline-flex cursor-pointer items-center gap-8 rounded-full border bg-transparent px-14 py-8 text-[13px] leading-none whitespace-nowrap transition-all"
          :class="
            preview.activeName === file.name
              ? 'border-primary bg-[var(--menu-hover)] text-primary font-semibold'
              : 'border-[var(--el-border-color-lighter)] text-[var(--el-text-color-regular)] hover:border-primary hover:text-primary'
          "
          @click="selectFile(file.name)"
        >
          <span
            class="h-8 w-8 shrink-0 rounded-full"
            :class="getExtDotClass(file.ext, preview.activeName === file.name)"
          />
          <span>{{ file.name }}</span>
        </button>
      </nav>

      <section v-if="activeFile" class="flex min-h-0 flex-1 flex-col">
        <div
          class="flex items-center justify-between gap-12 border-b border-[rgba(255,255,255,0.06)] bg-[#21252b] px-16 py-10 text-[#abb2bf]"
        >
          <div class="flex min-w-0 items-center gap-8">
            <el-icon class="shrink-0 text-[15px] text-[#61afef]"><Document /></el-icon>
            <span class="truncate font-mono text-[13px] whitespace-nowrap text-[#e5e9f0]">
              {{ activeFile.name }}
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-10 text-xs">
            <span>{{ activeFile.langLabel }}</span>
            <span class="h-12 w-1 bg-[rgba(255,255,255,0.12)]" />
            <span>{{ activeFile.lines }} 行</span>
          </div>
        </div>

        <div
          :key="preview.activeName"
          v-highlight
          class="gen-code-editor min-h-0 flex-1 overflow-auto bg-[#282c34]"
        >
          <pre><code :class="activeFile.langClass">{{ activeFile.content }}</code></pre>
        </div>
      </section>

      <el-empty v-else-if="!loading" description="暂无预览内容" class="flex-1 py-48" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.gen-code-editor {
  :deep(pre) {
    margin: 0;
    min-height: 100%;
    padding: 18px 20px 24px;
    background: #282c34;
  }

  :deep(code) {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre;
  }
}
</style>
