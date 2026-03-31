<template>
  <div class="glass-card glass-card-hover p-2 rounded-xl min-w-[280px] flex items-center space-x-2">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <input 
      v-model="input"
      type="text" 
      placeholder="Ask for summary, cover, etc..."
      class="flex-1 bg-transparent border-none text-sm focus:ring-0 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
      @keyup.enter="submit"
    />
    <button 
      @click="submit"
      class="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center shadow-md shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30"
      :disabled="!input.trim()"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{ data: any }>()
const input = ref('')

const submit = () => {
  if (input.value.trim() && props.data.onSubmit) {
    props.data.onSubmit(input.value)
    input.value = ''
  }
}
</script>
