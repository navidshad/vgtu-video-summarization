<template>
  <div class="absolute left-6 top-6 z-30 flex items-center bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shadow-lg">
    <SlimTooltip text="Pan View" placement="bottom">
      <button 
        @click="$emit('update:modelValue', 'pan')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'pan' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
        </svg>
      </button>
    </SlimTooltip>
    
    <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
    
    <SlimTooltip text="Select Tool" placement="bottom">
      <button 
        @click="$emit('update:modelValue', 'select')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'select' ? 'bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2.5" stroke="currentColor" fill="none" stroke-dasharray="4 2"></rect>
          <path d="M7 7h1v1H7zM16 7h1v1h-1zM7 16h1v1H7zM16 16h1v1h-1z" fill="currentColor"></path>
        </svg>
      </button>
    </SlimTooltip>

    <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

    <SlimTooltip text="Group Frames" placement="bottom">
      <button 
        @click="$emit('update:modelValue', 'frame')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'frame' ? 'bg-secondary text-white shadow-md shadow-secondary/20 ring-1 ring-secondary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zM14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
        </svg>
      </button>
    </SlimTooltip>
  </div>
</template>

<script setup lang="ts">
import SlimTooltip from '../SlimTooltip.vue'
type ToolMode = 'pan' | 'select' | 'frame'

defineProps<{
  modelValue: ToolMode
}>()

defineEmits<{
  (e: 'update:modelValue', value: ToolMode): void
}>()
</script>
