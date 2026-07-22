<template>
  <div
    class="mb-16 text-base overflow-hidden border border-[var(--layout-glass-border)] rounded-[22px] bg-[var(--layout-glass-bg)] shadow-[var(--layout-shadow)] backdrop-blur-[18px]"
  >
    <div
      class="overflow-hidden py-14 px-16 text-[var(--navbar-text)] cursor-pointer border-b border-transparent transition-[background] duration-200 hover:bg-[var(--menu-hover)]"
      :class="{ 'border-b-[var(--layout-glass-border)]': modelValue }"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <div class="flex items-center gap-14 font-[650]">
        <el-icon
          size="16"
          :class="['inline-flex items-center justify-center w-26 h-26 rounded-full text-[var(--current-color,var(--el-color-primary))] bg-[var(--menu-hover)] transition-transform duration-200', modelValue ? 'rotate-0' : '-rotate-90']"
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
      <div v-show="modelValue" ref="wrapperRef" class="overflow-hidden">
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
