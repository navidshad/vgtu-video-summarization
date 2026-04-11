<template>
  <div
    class="absolute left-6 top-6 z-30 flex items-center bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shadow-lg">
    <SlimTooltip text="Pan Tool" placement="bottom">
      <button @click="$emit('update:modelValue', 'pan')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'pan' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'">
        <Icon name="iconify tabler--hand-stop" class="w-5 h-5" />
      </button>
    </SlimTooltip>

    <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

    <SlimTooltip text="Select Tool" placement="bottom">
      <button @click="$emit('update:modelValue', 'select')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'select' ? 'bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'">
        <Icon name="iconify tabler--pointer" class="w-5 h-5" />
      </button>
    </SlimTooltip>

    <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

    <SlimTooltip text="Group Frames" placement="bottom">
      <button @click="$emit('update:modelValue', 'frame')"
        class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
        :class="modelValue === 'frame' ? 'bg-secondary text-white shadow-md shadow-secondary/20 ring-1 ring-secondary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'">
        <Icon name="iconify tabler--layout-grid" class="w-5 h-5" />
      </button>
    </SlimTooltip>
  </div>
</template>

<script setup lang="ts">
import { Icon, IconButton } from 'pilotui/elements'
import SlimTooltip from '../SlimTooltip.vue'
type ToolMode = 'pan' | 'select' | 'frame'

defineProps<{
  modelValue: ToolMode
}>()

defineEmits<{
  (e: 'update:modelValue', value: ToolMode): void
}>()
</script>
