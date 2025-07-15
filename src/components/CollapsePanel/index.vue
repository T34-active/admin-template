<template>
  <div class="border rounded-2xl mb-16" :class="modelValue ? 'border' : 'border-b-none'">
    <div
      class="overflow-hidden p-16 border-b border-solid bg-baseBg text-primaryText cursor-pointer dark:bg-black"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <div class="flex items-center gap-x-4 dark:text-white">
        <el-icon
          size="16"
          :class="['transition-transform duration-200', modelValue ? 'rotate-0' : '-rotate-90']"
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
