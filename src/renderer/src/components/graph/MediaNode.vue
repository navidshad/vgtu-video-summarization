<template>
  <div class="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md min-w-[200px] border border-zinc-200 dark:border-zinc-700">
    <Handle v-if="data.hasInput !== false" type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="flex items-center space-x-2 mb-2">
      <div class="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded flex items-center justify-center text-xl">
        🎥
      </div>
      <div>
        <div class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ data.filename || 'Video File' }}</div>
        <div class="text-xs font-medium" 
             :class="videoStore.activeBackgroundTasks.some(t => t.state === 'error') ? 'text-red-500' : 'text-blue-500'"
             v-if="videoStore.activeBackgroundTasks.length > 0">
             {{ videoStore.activeBackgroundTasks.some(t => t.state === 'error') ? 'Processing Error' : 'Processing...' }}
        </div>
        <div class="text-xs text-zinc-500" v-else>{{ data.size || 'Original File' }}</div>
      </div>
    </div>
    
    <!-- Background Tasks Progress -->
    <div v-if="videoStore.activeBackgroundTasks.length > 0" class="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 space-y-3 w-56">
      <div v-for="task in videoStore.activeBackgroundTasks" :key="task.id" class="text-xs">
        <div class="flex justify-between items-center mb-1" :class="task.state === 'error' ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400'">
          <span class="truncate pr-2 font-medium">{{ task.name }}</span>
          <div v-if="task.state === 'error'" class="flex items-center space-x-2 flex-shrink-0">
            <span class="text-[10px] uppercase tracking-wider font-bold">Failed</span>
            <button @click.stop="videoStore.retryPreprocessing(videoStore.currentThreadId!)" class="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded text-[10px] uppercase font-bold text-red-600 dark:text-red-400 transition-colors cursor-pointer pointer-events-auto">Retry</button>
          </div>
          <span v-else>{{ task.progress !== undefined ? `${task.progress}%` : '' }}</span>
        </div>
        <div v-if="task.state === 'error'" class="text-[10px] text-red-500/80 mb-2 leading-tight break-words">{{ task.error || 'Unknown error occurred' }}</div>
        
        <div v-if="task.progress !== undefined && task.state !== 'error'" class="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${task.progress}%` }"></div>
        </div>
      </div>
    </div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'

defineProps<{ data: any }>()
const videoStore = useVideoStore()
</script>
