<template>
  <div class="icon-body">
    <el-input
      v-model="iconName"
      clearable
      placeholder="请输入图标名称"
      @clear="filterIcons"
      @input="filterIcons"
    >
      <template #suffix><i class="el-icon-search el-input__icon" /></template>
    </el-input>
    <div class="icon-list h-200 grid grid-cols-12 gap-5 pt-2">
      <div
        v-for="(item, index) in iconList"
        :key="index"
        @click="selectedIcon(item)"
        class="col-span-4 flex items-center gap-x-5 p-5 w-full cursor-pointer hover:bg-baseBg"
      >
        <svg-icon :icon-class="item" class="size-20" />
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import icons from './requireIcons'

const iconName = ref('')
const iconList = ref(icons)
const emit = defineEmits(['selected'])

function filterIcons() {
  iconList.value = icons
  if (iconName.value) {
    iconList.value = icons.filter((item) => item.indexOf(iconName.value) !== -1)
  }
}

function selectedIcon(name: any) {
  emit('selected', name)
  document.body.click()
}

function reset() {
  iconName.value = ''
  iconList.value = icons
}

defineExpose({
  reset,
})
</script>

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  overflow-y: scroll;

  .icon-list {
    span {
      display: inline-block;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
    }
  }
}
</style>
