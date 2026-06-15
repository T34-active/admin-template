<template>
  <div class="flex items-start w-full gap-x-4">
    <el-upload
      ref="imageUpload"
      multiple
      :http-request="customUploadRequest"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon><plus /></el-icon>
    </el-upload>

    <template v-if="isShowTip">
      <div v-if="!$slots.tip && tip === ''">
        <div class="text-xs text-primary">请上传 {{ documentName }}</div>
        <div class="text-mediumText text-xs">
          <span>支持 {{ fileType.join('/') }}，容量 {{ fileSize }}MB 以内。</span>
          <span v-if="limit > 1" class="text-warning font-bold">最多上传 {{ limit }} 张</span>
        </div>
      </div>
      <slot v-else name="tip" />
    </template>

    <el-drawer
      v-model="dialogVisible"
      title="图片预览"
      append-to-body
      size="50%"
      :close-on-click-modal="false"
    >
      <img :src="dialogImageUrl" class="w-full h-auto object-contain" alt="预览图" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'
import type { PropType } from 'vue'
import { deleteImage, picUpload } from '@/api/region'

/**
 * 结构定义：
 * UI 层：符合 el-upload 的接口
 * 业务层 (raw)：符合后端 picVoList 的接口
 */
interface UiFile {
  name: string
  url: string
  raw?: any // 存储后端需要的完整对象
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<UiFile[]>,
    default: () => [],
  },
  limit: { type: Number, default: 1 },
  fileSize: { type: Number, default: 5 },
  fileType: { type: Array as PropType<string[]>, default: () => ['png', 'jpg', 'jpeg'] },
  isShowTip: { type: Boolean, default: true },
  tip: { type: String, default: '' },
  documentName: { type: String, default: '' },
  documentType: { type: String, default: '' },
  merchantInfoId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change'])
const { proxy } = getCurrentInstance()

const headers = ref({ Authorization: 'Bearer ' + getToken() })
const fileList = ref<UiFile[]>([])
const pendingCount = ref(0)
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 深度监听：将 modelValue 同步到 el-upload 内部状态
watch(
  () => props.modelValue,
  (val) => {
    fileList.value = Array.isArray(val) ? [...val] : []
  },
  { immediate: true, deep: true },
)

/** 上传前校验 */
function handleBeforeUpload(file: File) {
  console.log(props.merchantInfoId)
  if (!props.merchantInfoId) {
    proxy.$modal.msgError('请先选择所属商户')
    return false
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!props.fileType.includes(ext)) {
    proxy.$modal.msgError(`格式错误，仅支持 ${props.fileType.join('/')}`)
    return false
  }

  if (file.size / 1024 / 1024 > props.fileSize) {
    proxy.$modal.msgError(`图片不能超过 ${props.fileSize}MB`)
    return false
  }

  pendingCount.value++
  proxy.$modal.loading('上传中...')
  return true
}

/**
 * 文件转 Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file) // 带 data:image/png;base64 前缀
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

/**
 * 自定义上传逻辑：发 JSON 给后台
 */
async function customUploadRequest({ file, onSuccess, onError }) {
  try {
    const base64 = await fileToBase64(file)
    const payload = {
      documentName: props.documentName || file.name || '未命名文件',
      documentType: props.documentType || '0000',
      service: 'pic_upload',
      picBase64: base64,
      merchantInfoId: props.merchantInfoId,
    }
    const res = await picUpload(payload)
    onSuccess(res.data, file)
  } catch (err) {
    onError(err)
  } finally {
    proxy.$modal.closeLoading()
  }
}

/** 上传成功处理 */
function handleUploadSuccess(res: any, file: any) {
  proxy.$modal.closeLoading()
  pendingCount.value--

  if (res.resCode !== '0000') {
    proxy.$modal.msgError(res.resMsg || '上传失败')
    return
  }

  // 构建统一的 UI + 业务结构
  const newFile: UiFile = {
    name: props.documentName || file.name,
    url: res.presignedUrl || res.url,
    raw: {
      documentName: props.documentName,
      documentType: props.documentType,
      filePath: res.filePath,
      fileSize: String(res.fileSize || ''),
      fileId: res.fileId,
      url: res.presignedUrl,
    },
  }

  const updatedValue = [...fileList.value, newFile]

  // 核心：触发 update 和 change
  emit('update:modelValue', updatedValue)
  emit('change', updatedValue)

  if (pendingCount.value <= 0) {
    proxy.$modal.msgSuccess('上传成功')
    pendingCount.value = 0
  }
}

/** 删除图片 */
async function handleRemove(file: any) {
  const fileId = file.raw?.fileId || file.raw?.file_id

  if (fileId) {
    try {
      await deleteImage({ fileId })
    } catch (e) {
      console.warn('服务器删除失败，仅从前端移除')
    }
  }

  const updatedValue = fileList.value.filter((f) => f.url !== file.url)

  emit('update:modelValue', updatedValue)
  emit('change', updatedValue)
}

function handleUploadError() {
  pendingCount.value = 0
  proxy.$modal.closeLoading()
  proxy.$modal.msgError('图片上传失败')
}

function handlePictureCardPreview(file: any) {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

function handleExceed() {
  proxy.$modal.msgError(`最多上传 ${props.limit} 张图片`)
}
</script>

<style scoped lang="scss">
:deep(.hide .el-upload--picture-card) {
  display: none;
}
:deep(.el-upload-list__item),
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  border-color: var(--layout-glass-border);
  border-radius: 18px;
  overflow: hidden;
}

:deep(.el-upload-list__item) {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

:deep(.el-upload--picture-card) {
  background: var(--input-bg);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: var(--current-color, var(--el-color-primary));
    background: var(--menu-hover);
    transform: translateY(-1px);
  }
}

:deep(.el-icon) {
  color: var(--current-color, var(--el-color-primary));
}

</style>
