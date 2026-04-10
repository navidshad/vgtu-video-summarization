<template>
  <div class="relative group/slim-tooltip inline-flex items-center justify-center">
    <!-- Trigger -->
    <slot />
    
    <!-- Tooltip Content -->
    <div 
      class="absolute invisible group-hover/slim-tooltip:visible opacity-0 group-hover/slim-tooltip:opacity-100 transition-all duration-200 z-[100] pointer-events-none"
      :class="[
        positionClasses,
        'px-2 py-1 rounded bg-zinc-900/90 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.05em] whitespace-nowrap shadow-2xl flex items-center gap-1.5'
      ]"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
}>(), {
  placement: 'left'
})

const positionClasses = computed(() => {
  switch (props.placement) {
    case 'top':
      return 'bottom-full mb-2 left-1/2 -translate-x-1/2 scale-90 group-hover/slim-tooltip:scale-100'
    case 'bottom':
      return 'top-full mt-2 left-1/2 -translate-x-1/2 scale-90 group-hover/slim-tooltip:scale-100'
    case 'right':
      return 'left-full ml-2 top-1/2 -translate-y-1/2 scale-90 group-hover/slim-tooltip:scale-100'
    case 'left':
    default:
      return 'right-full mr-2 top-1/2 -translate-y-1/2 scale-90 group-hover/slim-tooltip:scale-100'
  }
})
</script>

<style scoped>
/* Scoped styles removed as they were interfering with pointer events */
</style>
