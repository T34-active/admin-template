<template>
  <el-input
    v-model="iconName"
    clearable
    placeholder="请输入图标名称"
    @clear="filterIcons"
    @input="filterIcons"
  >
    <template #suffix>
      <el-icon>
        <Search />
      </el-icon>
    </template>
  </el-input>
  <div class="icon-select-list w-full overflow-y-scroll mt-12 h-200">
    <div class="icon-list flex flex-wrap">
      <div
        v-for="item in iconList"
        :key="item"
        @click="selectedIcon(item)"
        class="icon-select-item w-1/3 flex items-center gap-x-10 py-16 px-12 h-25 cursor-pointer"
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

<style scoped lang="scss">
:deep(.el-input__wrapper) {
  border-radius: 14px;
  background: var(--input-bg);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--current-color, var(--el-color-primary)) inset,
    0 0 0 3px rgba(64, 158, 255, 0.12);
}

.icon-select-list {
  padding: 8px;
  border: 1px solid var(--layout-glass-border);
  border-radius: 18px;
  background: var(--layout-glass-bg);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
}

.icon-select-item {
  border-radius: 12px;
  color: var(--navbar-text);
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(--current-color, var(--el-color-primary));
    background: var(--menu-hover);
    transform: translateY(-1px);
  }
}

</style>
