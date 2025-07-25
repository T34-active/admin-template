<template>
  <el-image
    :src="`${realSrc}`"
    fit="cover"
    :style="`width:${realWidth};height:${realHeight};`"
    :preview-src-list="realSrcList"
    preview-teleported
  >
    <template #error>
      <div class="image-slot">
        <el-icon><picture-filled /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
import { isExternal } from '@/utils/validate'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: '56px',
  },
  height: {
    type: [Number, String],
    default: '56px',
  },
})

const realSrc = computed(() => {
  if (!props.src) {
    return
  }
  const real_src = props.src.split(',')[0]
  if (isExternal(real_src)) {
    return real_src
  }
  return import.meta.env.VITE_APP_BASE_URL + real_src
})

const realSrcList = computed(() => {
  if (!props.src) {
    return
  }
  const real_src_list = props.src.split(',')
  const srcList = []
  real_src_list.forEach((item) => {
    if (isExternal(item)) {
      return srcList.push(item)
    }
    return srcList.push(import.meta.env.VITE_APP_BASE_URL + item)
  })
  return srcList
})

const realWidth = computed(() =>
  typeof props.width === 'string' ? props.width : `${props.width}px`,
)

const realHeight = computed(() =>
  typeof props.height === 'string' ? props.height : `${props.height}px`,
)
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  background-color: #ebeef5;
  box-shadow: 0 0 5px 1px #ccc;
  :deep(.el-image__inner) {
    transition: all 0.3s;
    cursor: pointer;
    &:hover {
      transform: scale(1.2);
    }
  }
  :deep(.image-slot) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 30px;
  }
}
</style>
