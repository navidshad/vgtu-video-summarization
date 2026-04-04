<template>
  <div class="glass-card glass-card-hover input-focus-ring p-2 rounded-xl min-w-[280px] flex items-end space-x-2">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <textarea 
      v-model="input"
      ref="textareaRef"
      placeholder="Ask for summary, cover, etc..."
      class="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 resize-none py-1.5 px-1 leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar"
      rows="1"
      @input="adjustTextarea"
      @keydown.enter="handleEnter"
    ></textarea>
    <button 
      @click="submit"
      class="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 mb-0.5"
      :disabled="!input.trim()"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{ data: any }>()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && input.value.trim()) {
    e.preventDefault()
    submit()
  }
}

const submit = () => {
  if (input.value.trim() && props.data.onSubmit) {
    props.data.onSubmit(input.value)
    input.value = ''
    setTimeout(adjustTextarea, 0)
  }
}

onMounted(() => {
  adjustTextarea()
})
</script>
