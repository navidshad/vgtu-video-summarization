<template>
  <div class="animate-fade-in-up mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-3">
    <div v-if="overline" class="text-xs font-bold uppercase tracking-widest text-primary mb-2">
      {{ overline }}
    </div>
    
    <div class="flex items-end gap-6">
      <div v-if="showBack" class="mb-2">
        <slot name="back">
           <!-- Default back button can go here or be provided by parent -->
        </slot>
      </div>

      <div class="flex-1 flex items-end justify-between">
        <div>
          <h1 class="text-4xl font-heading font-black text-zinc-900 dark:text-white tracking-tight leading-tight mb-2">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
            {{ subtitle }}
          </p>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  overline?: string
  showBack?: boolean
}>()
</script>
