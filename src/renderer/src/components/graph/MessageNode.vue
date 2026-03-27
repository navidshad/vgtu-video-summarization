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
    
    <div class="flex justify-between items-center mb-1">
      <div class="text-[10px] opacity-70 font-semibold uppercase tracking-wider">{{ data.sender }}</div>
      <button 
        v-if="data.sender === 'user'"
        @click.stop="videoStore.retryMessage(id)"
        class="bg-blue-100 dark:bg-zinc-700/50 hover:bg-blue-200 dark:hover:bg-zinc-600 rounded px-1.5 py-0.5 text-[9px] uppercase font-bold transition-colors cursor-pointer pointer-events-auto"
      >
        Retry
      </button>
    </div>
    <div class="text-sm whitespace-pre-wrap leading-snug">{{ data.text }}</div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{ id: string, data: any }>()
const videoStore = useVideoStore()
</script>
