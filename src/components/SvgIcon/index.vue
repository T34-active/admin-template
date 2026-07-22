<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        const base = 'svg-icon inline-block w-[1em] h-[1em] relative fill-current align-[-2px]'
        if (props.className) {
          return `${base} ${props.className}`
        }
        return base
      }),
    }
  },
})
</script>

