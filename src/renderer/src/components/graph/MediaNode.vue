<template>
  <div class="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md min-w-[200px] border border-zinc-200 dark:border-zinc-700">
    <Handle v-if="data.hasInput !== false" type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="flex items-center space-x-2 mb-2">
      <div class="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded flex items-center justify-center text-xl">
        🎥
      </div>
      <div>
        <div class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ data.filename || 'Video File' }}</div>
        <div class="text-xs text-zinc-500">{{ data.size || 'Unknown size' }}</div>
      </div>
    </div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{ data: any }>()
</script>
