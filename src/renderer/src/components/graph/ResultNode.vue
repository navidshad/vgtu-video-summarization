<template>
  <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg shadow min-w-[200px] border border-green-200 dark:border-green-800">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Result: {{ data.type }}</div>
    
    <div v-if="data.type === 'summary'" class="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-4">
      {{ data.content }}
    </div>
    
    <div v-else-if="data.type === 'cover'" class="flex space-x-2">
      <div v-for="(img, idx) in data.images" :key="idx" class="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
        <img :src="img" class="w-full h-full object-cover" />
      </div>
    </div>
    
    <button class="mt-3 w-full py-1.5 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
      View Full Output
    </button>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{ data: any }>()
</script>
