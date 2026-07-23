<template>
  <component :is="type" v-bind="linkProps()">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { isExternal } from '@/utils/validate'
import { openExternal } from '@/utils/openExternal'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
})

const isExt = computed(() => {
  return isExternal(props.to)
})

const type = computed(() => {
  if (isExt.value) {
    return 'a'
  }
  return 'router-link'
})

async function onExternalClick(event: MouseEvent) {
  event.preventDefault()
  await openExternal(String(props.to))
}

function linkProps() {
  if (isExt.value) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener noreferrer',
      onClick: onExternalClick,
    }
  }
  return {
    to: props.to,
  }
}
</script>
