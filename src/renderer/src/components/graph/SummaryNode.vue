<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[280px] max-w-[320px] overflow-hidden flex flex-col group transition-all duration-300">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Header -->
    <div class="px-4 py-3 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent),0.5)]"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500">AI Summary</span>
        </div>
        <button @click="data.onDelete" class="p-1 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    </div>

    <!-- Summary Content -->
    <div 
        class="p-5 max-h-96 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0 pb-12"
        v-html="renderMarkdown(data.content)"
    ></div>
    
    <!-- Branching Input -->
    <div class="p-3 bg-black/5 dark:bg-black/20 mt-auto border-t border-black/5 dark:border-white/5">
      <div class="flex items-center space-x-2 bg-white/50 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 focus-within:border-primary/50 transition-all duration-300">
        <input 
          v-model="input"
          type="text" 
          placeholder="Adjust or follow up..."
          class="flex-1 bg-transparent border-none text-[11px] focus:ring-0 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 py-1 px-1"
          @keyup.enter="submit"
        />
        <button 
          @click="submit"
          class="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-30 transition-all shadow-md shadow-primary/20"
          :disabled="!input.trim()"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps<{ data: any }>()
const input = ref('')

const submit = () => {
  if (input.value.trim() && props.data.onSubmit) {
    props.data.onSubmit(input.value)
    input.value = ''
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
</style>
