<script setup lang="ts">
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance()

const emit = defineEmits(['update:modelValue']) // 触发事件，通知父组件

const uploadUrl = ref(import.meta.env.VITE_APP_BASE_URL + '/website/upload/uploadImages')
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const editorRef = shallowRef()
const content = ref('')

const props = defineProps({
  modelValue: { type: String, default: '' }, // 绑定 v-model
  height: { type: Number, default: null },
  minHeight: { type: Number, default: null },
  readOnly: { type: Boolean, default: false },
  fileSize: { type: Number, default: 5 },
  type: { type: String, default: 'url' },
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== content.value) {
      content.value = newValue || '' // 同步 modelValue 到 content
    }
  },
  { immediate: true },
)

// 监听 content 变化，通知父组件
watch(content, (newValue) => {
  emit('update:modelValue', newValue)
})

// 编辑器配置
const editorConfig = {
  placeholder: '',
  MENU_CONF: {
    uploadImage: {
      server: uploadUrl.value,
      timeout: 5 * 1000, // 5s
      meta: {
        fileName: 'imageName',
      },
      fieldName: 'file',
      metaWithUrl: false, // join params to url
      headers: headers.value,
      // maxFileSize: props.fileSize * 10,
      maxFileSize: 10 * 1024 * 1024, // 10M
      base64LimitSize: 5 * 1024, // insert base64 format, if file's size less than 5kb
      onBeforeUpload(file) {
        // console.log('onBeforeUpload', file);
        // 获取动态键名
        const fileKey = Object.keys(file)[0] // 获取第一个键名
        const fileData = file[fileKey] // 访问该键名对应的值
        // 访问文件的属性
        const fileName = fileData.name // 获取文件名
        const fileType = fileData.meta.type // 获取文件类型
        const fileSize = fileData.size // 获取文件大小
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg']
        const isAllowedType = allowedTypes.includes(fileType)
        // 检验文件格式
        if (!isAllowedType) {
          proxy.$modal.msgError('图片格式错误!')
          return false // 阻止上传
        }
        // 校检文件大小
        if (props.fileSize) {
          const isLt = fileSize / 1024 / 1024 < props.fileSize
          if (!isLt) {
            proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
            return false // 阻止上传
          }
        }
        // console.log(
        //   准备上传文件: ${fileName}, 类型: ${fileType}, 大小: ${fileSize} bytes
        // );
        return file // 允许上传
      },
      // 自定义插入图片
      customInsert(res, insertFn) {
        // console.log('服务器返回的图片数据：', res);
        // 假设 res 中有 url 字段是图片的路径
        if (res.code === 200 && res.msg) {
          const url = res.msg // 获取图片 URL
          const alt = res.msg || '' // 可以用原始文件名作为 alt
          const href = '' // 可以用图片的链接作为 href，或者留空
          insertFn(url, alt, href) // 调用插入函数
          proxy.$modal.msgSuccess('上传成功')
        } else {
          // console.error('图片上传失败：' + (res.msg || '未知错误'));
        }
      },
      onProgress(progress) {
        // console.log('onProgress', progress);
      },
      onSuccess(file, res) {
        // console.log('onSuccess', file, res);
      },
      onFailed(file, res) {
        // console.error('onFailed', file, res);
      },
      onError(file, err, res) {
        // console.error('onError', file, err, res);
      },
    },
  },
}

const toolbarConfig = { excludeKeys: ['fullScreen', 'group-video', 'emotion'] }

const handleCreated = (editor) => {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
</script>

<template>
  <div class="border">
    <Toolbar
      :editor="editorRef"
      style="border-bottom: 1px solid #ccc"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      v-model="content"
      :defaultConfig="editorConfig"
      style="height: 600px; overflow-y: hidden"
      @onCreated="handleCreated"
    />
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>
<style scoped>
.border {
  border: 1px solid #ccc;
  border-radius: 1px;
  width: 100%;
}
</style>
