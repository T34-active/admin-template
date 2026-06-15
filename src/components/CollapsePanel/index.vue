<template>
  <div class="collapse-panel mb-16 text-base" :class="{ 'is-open': modelValue }">
    <div class="collapse-panel__header" @click="$emit('update:modelValue', !modelValue)">
      <div class="collapse-panel__title">
        <el-icon
          size="16"
          :class="[
            'collapse-panel__icon transition-transform duration-200',
            modelValue ? 'rotate-0' : '-rotate-90',
          ]"
        >
          <ArrowDown />
        </el-icon>
        <span>{{ title }}</span>
      </div>
    </div>
    <!-- 使用带 JS 钩子的 transition -->
    <transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div v-show="modelValue" ref="wrapperRef" class="collapse-panel__body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
  }>(),
  {
    title: '设置搜索条件',
    modelValue: true,
  },
)
const wrapperRef = ref<HTMLElement | null>(null)

function beforeEnter(el: Element) {
  const dom = el as HTMLElement
  dom.style.height = '0'
  dom.style.opacity = '0'
}

function enter(el: Element) {
  const dom = el as HTMLElement
  dom.style.transition = 'all 0.3s ease'
  dom.style.height = dom.scrollHeight + 'px'
  dom.style.opacity = '1'
}

function afterEnter(el: Element) {
  const dom = el as HTMLElement
  dom.style.height = 'auto'
  dom.style.transition = ''
}

function beforeLeave(el: Element) {
  const dom = el as HTMLElement
  dom.style.height = dom.scrollHeight + 'px'
  dom.style.opacity = '1'
}

function leave(el: Element) {
  const dom = el as HTMLElement
  dom.style.transition = 'all 0.3s ease'
  dom.style.height = '0'
  dom.style.opacity = '0'
}

function afterLeave(el: Element) {
  const dom = el as HTMLElement
  dom.style.transition = ''
}

defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.collapse-panel {
  overflow: hidden;
  border: 1px solid var(--layout-glass-border);
  border-radius: 22px;
  background: var(--layout-glass-bg);
  box-shadow: var(--layout-shadow);
  backdrop-filter: blur(18px);
}

.collapse-panel__header {
  overflow: hidden;
  padding: 14px 16px;
  color: var(--navbar-text);
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: background 0.2s ease;

  &:hover {
    background: var(--menu-hover);
  }
}

.collapse-panel.is-open .collapse-panel__header {
  border-bottom-color: var(--layout-glass-border);
}

.collapse-panel__title {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 650;
}

.collapse-panel__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  color: var(--current-color, var(--el-color-primary));
  background: var(--menu-hover);
}

.collapse-panel__body {
  overflow: hidden;
}
</style>
