<template>
  <div @click="$emit('click')" class="h-full group cursor-pointer relative">
    <Card
      class="h-full !rounded-lg border !border-white/20 dark:!border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center text-center p-8 hover:-translate-y-2 hover:scale-95 overflow-hidden"
    >      
      <div class="relative z-10 flex flex-col items-center">
        <div
          class="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 flex items-center justify-center mb-6 text-zinc-400 group-hover:text-blue-500 border border-zinc-100/50 dark:border-zinc-700/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <h3
          class="font-heading font-bold text-xl text-zinc-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight"
        >
          Create New Edit
        </h3>
        
        <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-grow leading-relaxed">
          Transform your video into a concise masterpiece
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card } from 'pilotui/elements'

defineEmits(['click'])
</script>
