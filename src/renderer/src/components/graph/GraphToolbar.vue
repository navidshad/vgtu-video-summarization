<template>
  <div class="absolute left-6 top-6 z-30 flex items-center bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shadow-lg">
    <button 
      @click="$emit('update:modelValue', false)"
      title="Pan View"
      class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
      :class="!modelValue ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
    >
      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
      </svg>
    </button>
    <div class="w-px h-4 bg-zinc-200 dark:border-zinc-800 mx-1"></div>
    <button 
      @click="$emit('update:modelValue', true)"
      title="Select Tool"
      class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
      :class="modelValue ? 'bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
    >
      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2.5" stroke="currentColor" fill="none" stroke-dasharray="4 2"></rect>
        <path d="M7 7h1v1H7zM16 7h1v1h-1zM7 16h1v1H7zM16 16h1v1h-1z" fill="currentColor"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
