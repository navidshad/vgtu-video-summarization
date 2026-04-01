<template>
  <div class="glass-card glass-card-hover p-4 rounded-2xl min-w-[250px]">
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
      <div class="flex items-center space-x-2">
        <button v-if="data.onStop && data.status === 'running'" @click="data.onStop" class="flex items-center space-x-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all group/stop border border-red-500/20 hover:border-red-500/40" title="Stop process">
          <div class="w-2 h-2 bg-red-500 rounded-sm"></div>
          <span class="text-[10px] font-bold tracking-wider uppercase leading-none">Stop</span>
        </button>

        <button v-if="data.onDelete" @click="data.onDelete" class="p-1 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500 transition-colors" title="Delete task node">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="space-y-2">
      <div v-for="(step, index) in data.steps" :key="index" class="flex items-center space-x-2 text-xs">
        <div 
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-accent': step.status === 'done',
            'bg-primary animate-pulse': step.status === 'active',
            'bg-zinc-300 dark:bg-zinc-600': step.status === 'pending'
          }"
        ></div>
        <span 
          :class="step.status === 'active' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500'"
        >
          {{ step.name }}
        </span>
      </div>
    </div>

    <!-- Overall Progress bar -->
    <div v-if="data.progress !== undefined" class="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-700/50 rounded-full overflow-hidden shadow-inner">
      <div class="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0.3)]" :style="{ width: `${data.progress}%` }"></div>
    </div>
    
    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{ data: any }>()
</script>
