<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/system/user'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const open = ref(false)
const visible = ref(false)
const title = ref('修改头像')

// 图片裁剪数据
const options = reactive({
  img: userStore.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: 'png', // 默认生成截图为PNG格式
  previews: {
    img: '',
    url: '',
  }, // 预览数据
  visible: false,
})

/** 编辑头像 */
function editCropper() {
  open.value = true
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}
/** 覆盖默认上传行为 */
function requestUpload() {
  console.log('覆盖默认上传行为')
}
/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft()
}
/** 向右旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight()
}
/** 图片缩放 */
function changeScale(num: number) {
  num = num || 1
  proxy.$refs.cropper.changeScale(num)
}
/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf('image/') === -1) {
    proxy.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
    }
  }
}
/** 上传图片 */
async function uploadImg() {
  try {
    const blob = await proxy.$refs.cropper.getCropBlob()
    const formData = new FormData()
    formData.append('avatarfile', blob)
    const response = await uploadAvatar(formData)
    const baseUrl = import.meta.env.VITE_APP_BASE_URL.replace(/\/$/, '')
    const imgUrl = response.imgUrl.replace(/^\//, '')
    const fullUrl = `${baseUrl}/${imgUrl}`
    options.img = fullUrl
    userStore.avatar = fullUrl
    visible.value = false
    open.value = false
    proxy.$modal.msgSuccess('修改成功')
  } catch (err) {
    proxy.$modal.msgError('上传失败')
    console.error(err)
  }
}

/** 实时预览 */
function realTime(data): Promise<any> {
  options.previews = data
}
/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.avatar
  options.visible = false
}
</script>
<template>
  <div>
    <div class="user-info-head" @click="editCropper()">
      <img :src="options.img" title="点击上传头像" class="rounded-full img-lg" alt="点击上传头像" />
    </div>
    <el-dialog
      v-model="open"
      :title="title"
      width="800px"
      append-to-body
      @opened="modalOpened"
      @close="closeDialog"
      :close-on-click-modal="false"
    >
      <el-row :gutter="20">
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            v-if="visible"
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img
              :src="options.previews.url"
              :style="options.previews.img"
              :alt="options.previews.url"
            />
          </div>
        </el-col>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>
