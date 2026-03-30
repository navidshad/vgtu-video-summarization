<template>
  <div class="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg min-w-[250px] border border-orange-200 dark:border-orange-900/50">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div v-if="data.status === 'running'" class="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
        <div v-else-if="data.status === 'completed'" class="text-green-500">✓</div>
        <div v-else-if="data.status === 'failed'" class="text-red-500">✗</div>
        <div v-else class="text-zinc-400">⋯</div>
        
        <div class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
          {{ data.type || 'Task' }}
        </div>
      </div>
      <button v-if="data.onDelete" @click="data.onDelete" class="p-1 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500 transition-colors" title="Delete task node">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>

    <!-- Progress Steps -->
    <div class="space-y-2">
      <div v-for="(step, index) in data.steps" :key="index" class="flex items-center space-x-2 text-xs">
        <div 
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-green-500': step.status === 'done',
            'bg-orange-500 animate-pulse': step.status === 'active',
            'bg-zinc-300 dark:bg-zinc-600': step.status === 'pending'
          }"
        ></div>
        <span 
          :class="step.status === 'active' ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-500'"
        >
          {{ step.name }}
        </span>
      </div>
    </div>

    <!-- Overall Progress bar -->
    <div v-if="data.progress !== undefined" class="mt-3 h-1.5 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div class="h-full bg-orange-500 transition-all duration-300" :style="{ width: `${data.progress}%` }"></div>
    </div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{ data: any }>()
</script>
