<template>
  <div class="upload-file">
    <el-upload
      ref="uploadRef"
      class="upload-area"
      drag
      accept=".xlsx, .xls"
      :headers="headers"
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :auto-upload="false"
      :data="data"
      :on-change="handleChangeUpload"
      :before-remove="clearFiles"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            type="primary"
            underline="never"
            style="font-size: 12px; vertical-align: baseline"
            @click="downLoadTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: [String, Object, Array],
  fileSize: {
    type: Number,
    default: 5, // 单位 MB
  },
  fileType: {
    type: Array,
    default: () => ['xls', 'xlsx'],
  },
  uploadFileUrl: {
    type: String,
    default: '',
  },
  downLoadTemplate: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['success', 'update:modelValue'])

const { proxy } = getCurrentInstance()
const uploadRef = ref(null)

const headers = ref({
  Authorization: 'Bearer ' + getToken(),
})

/** 提交文件上传 */
function submitFile() {
  uploadRef.value.submit()
}

/** 上传前校验（文件大小 + 格式） */
function handleBeforeUpload(file) {
  const isValidSize = file.size / 1024 / 1024 < props.fileSize
  const fileExt = file.name.split('.').pop().toLowerCase()
  const isValidType = props.fileType.includes(fileExt)

  if (!isValidType) {
    proxy.$modal.msgError(`文件类型不支持，仅限：${props.fileType.join(', ')}`)
    return false
  }

  if (!isValidSize) {
    proxy.$modal.msgError(`文件大小不能超过 ${props.fileSize}MB`)
    return false
  }

  proxy.$modal.loading('正在上传文件，请稍候...')
  return true
}

// 上传文件改变
const handleChangeUpload = (file, fileList) => {
  if (fileList.length > 1) {
    proxy.$modal.msgWarning('只能上传一个文件')
    fileList.splice(1) // 删除多余的文件，保留第一个
  }
  emit('update:modelValue', fileList)
}

/** 上传成功回调 */
function handleUploadSuccess(res) {
  proxy.$modal.closeLoading()
  if (res.code === 200) {
    uploadRef.value.clearFiles()
    emit('success', res)
  } else {
    clearFiles()
    proxy.$modal.msgError(res.msg || '上传失败')
  }
}

/** 上传失败回调 */
function handleUploadError(err) {
  proxy.$modal.closeLoading()
  clearFiles()
  proxy.$modal.msgError('上传文件失败')
}

// 清空文件
const clearFiles = () => {
  uploadRef.value.clearFiles()
  emit('update:modelValue', '')
}

// 暴露方法
defineExpose({
  submitFile,
  clearFiles,
})
</script>

<style scoped lang="scss">
:deep(.el-upload-dragger) {
  padding: 20px 0 !important;
}
</style>
