<template>
  <div 
    class="p-3 rounded-lg shadow-sm min-w-[200px] max-w-[300px] border"
    :class="[
      data.sender === 'user' 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100' 
        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
    ]"
  >
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="text-xs opacity-70 mb-1 font-medium capitalize">{{ data.sender }}</div>
    <div class="text-sm whitespace-pre-wrap">{{ data.text }}</div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{ data: any }>()
</script>
