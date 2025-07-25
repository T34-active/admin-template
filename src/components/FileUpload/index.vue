<template>
  <div class="upload-file">
    <el-upload
      ref="fileUpload"
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
    >
      <!-- 上传按钮 -->
      <el-button type="primary">选取文件</el-button>
    </el-upload>
    <!-- 上传提示 -->
    <template v-if="isShowTip">
      <div v-if="!$slots.tip && tip === ''" class="el-upload__tip">
        请上传
        <template v-if="fileSize">
          大小不超过
          <b class="text-danger">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType">
          格式为
          <b class="text-danger">{{ fileType.join('/') }}</b>
        </template>
        的文件
      </div>
      <template v-else-if="$slots.tip">
        <slot name="tip" />
      </template>
      <div v-else class="text-secondaryText">
        {{ tip }}
      </div>
    </template>
    <!-- 文件列表 -->
    <transition-group
      class="flex flex-col rounded-xl"
      name="el-fade-in-linear"
      tag="ul"
      :class="fileList.length > 0 ? 'border' : ''"
    >
      <li v-for="(file, index) in fileList" :key="file.uid" class="p-1 flex items-center gap-x-2">
        <el-link :href="`${baseUrl}${file.url}`" target="_blank">
          <span class="el-icon-document">{{ getFileName(file.name) }}</span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link type="danger" @click="handleDelete(index)">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: [String, Object, Array] as any,
  // 数量限制
  limit: {
    type: Number,
    default: 5,
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array as () => Array<any>,
    default: () => ['doc', 'xls', 'xlsx', 'ppt', 'txt', 'pdf'],
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true,
  },
  // 自定义tip
  tip: {
    type: String,
    default: '',
  },
})

const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:modelValue'])
const number = ref(0)
const uploadList = ref<any[]>([])
const baseUrl = import.meta.env.VITE_APP_BASE_URL
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_URL + '/common/upload') // 上传文件服务器地址
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const fileList = ref<any[]>([])
// const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      let temp = 1
      // 首先将值转为数组
      const list = Array.isArray(val) ? val : props.modelValue!.split(',')
      // 然后将数组转为对象数组
      fileList.value = list.map((item: any) => {
        if (typeof item === 'string') {
          item = { name: item, url: item }
        }
        item.uid = item.uid || new Date().getTime() + temp++
        return item
      })
    } else {
      fileList.value = []
      return []
    }
  },
  { deep: true, immediate: true },
)

// 上传前校检格式和大小
function handleBeforeUpload(file: any) {
  // 校检文件类型
  if (props.fileType.length) {
    const fileName = file.name.split('.')
    const fileExt = fileName[fileName.length - 1]
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件！`)
      return false
    }
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB！`)
      return false
    }
  }
  proxy.$modal.loading('正在上传文件，请稍候...')
  number.value++
  return true
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个！`)
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError('上传文件失败')
}

// 上传成功回调
function handleUploadSuccess(res: any, file: any) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.url })
    uploadedSuccessfully()
  } else {
    number.value--
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(res.msg)
    proxy.$refs.fileUpload.handleRemove(file)
    uploadedSuccessfully()
  }
}

// 删除文件
function handleDelete(index: number) {
  fileList.value.splice(index, 1)
  emit('update:modelValue', listToString(fileList.value))
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    emit('update:modelValue', listToString(fileList.value))
    proxy.$modal.closeLoading()
  }
}

// 获取文件名称
function getFileName(name: any) {
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1)
  } else {
    return ''
  }
}

// 对象转成指定字符串分隔
function listToString(list: any, separator?: any) {
  let strs = ''
  separator = separator || ','
  for (const i in list) {
    if (list[i].url) {
      strs += list[i].url + separator
    }
  }
  return strs !== '' ? strs.slice(0, -separator.length) : ''
}
</script>
