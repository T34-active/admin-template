<template>
  <el-image
    :src="`${realSrc}`"
    fit="cover"
    class="rounded-[5px] bg-[#ebeef5] shadow-[0_0_5px_1px_#ccc]"
    :style="`width:${realWidth};height:${realHeight};`"
    :preview-src-list="realSrcList"
    preview-teleported
  >
    <template #error>
      <div class="image-slot center w-full h-full text-[#909399] text-30">
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

<style scoped>
:deep(.el-image__inner) {
  transition: all 0.3s;
  cursor: pointer;
}

:deep(.el-image__inner:hover) {
  transform: scale(1.2);
}
</style>
