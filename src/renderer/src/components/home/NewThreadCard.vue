<template>
  <div @click="$emit('click')" class="h-full group cursor-pointer">
    <Card
      class="h-full !rounded-[2.5rem] !bg-white dark:!bg-zinc-900 border !border-zinc-100 dark:!border-zinc-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col items-center justify-center p-6"
    >
      <!-- Dashed Inner Border Area -->
      <div
        class="w-full h-full rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 group-hover:border-primary/50 dark:group-hover:border-primary/50 transition-colors duration-500 flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-900/50 group-hover:bg-primary/5 dark:group-hover:bg-primary/5"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <h3
          class="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-primary transition-colors"
        >
          Create New Edit
        </h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Start a new video analysis</p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card } from 'pilotui/elements'

defineEmits(['click'])
</script>
