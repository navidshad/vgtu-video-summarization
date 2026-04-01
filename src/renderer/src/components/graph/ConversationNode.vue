<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[320px] max-w-[420px] overflow-hidden flex flex-col group">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Header with Actions -->
    <div class="px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Conversation</span>
      </div>
      <div class="flex items-center space-x-1">
        <button 
          v-if="!showInput && !data.hasInputInitially" 
          @click="showInput = true" 
          class="p-1 hover:bg-blue-500/10 rounded-md text-zinc-400 hover:text-blue-500 transition-colors"
          title="Branch from this node"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
        <button 
          @click="data.onDelete" 
          class="p-1 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
          title="Delete node and branches"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Messages List (Self-expanding height, Draggable) -->
    <div class="p-4 space-y-4 nowheel">
      <div v-for="msg in data.messages" :key="msg.id" 
           class="flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300"
           :class="msg.role === 'user' ? 'items-end' : 'items-start'">
        
        <div class="flex items-center space-x-2 px-1">
          <span class="text-[9px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500">{{ msg.role }}</span>
          <div v-if="msg.role === 'user'" @click="videoStore.retryMessage(msg.id)" class="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 uppercase">Retry</div>
        </div>

        <div 
          class="px-4 py-2.5 rounded-[1.25rem] text-sm leading-relaxed max-w-[90%] break-words relative overflow-hidden transition-all duration-300 group/msg"
          :class="[
            msg.role === 'user' 
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none shadow-lg shadow-primary/20 font-medium' 
              : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-black/5 dark:border-white/5 backdrop-blur-sm',
            msg.isPending ? 'ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10 transition-all duration-1000 animate-pulse' : ''
          ]"
        >
          <!-- Copy Button -->
          <button 
            v-if="msg.content && !msg.isPending"
            @click="copyMessage(msg.id, msg.content)"
            class="absolute top-1 right-1 p-1.5 rounded-lg opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-10"
            :class="[
              msg.role === 'user' 
                ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            ]"
            title="Copy message"
          >
            <svg v-if="copiedId !== msg.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <svg v-else class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </button>

          <div 
            v-if="msg.isPending && !msg.content" 
            class="text-zinc-400 italic font-medium flex items-center space-x-2"
          >
             <span>AI is thinking...</span>
          </div>
          <div 
            v-else 
            v-html="renderMarkdown(msg.content)" 
            class="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 shadow-none border-none pointer-events-auto"
            :class="msg.role === 'user' ? 'prose-invert text-white' : 'dark:prose-invert'"
          ></div>
          
          <!-- Files (Exclude Original) -->
          <div v-if="msg.files && msg.files.filter((f: any) => f.type !== 'original').length > 0" class="mt-2 space-y-2">
             <div v-for="file in msg.files.filter((f: any) => f.type !== 'original')" :key="file.url" class="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5">
                <div class="text-[10px] font-bold uppercase opacity-50">{{ file.type }}</div>
                <div class="text-[10px] truncate max-w-full">{{ file.url }}</div>
             </div>
          </div>

          <div v-if="msg.isPending" class="mt-3 pt-2 border-t border-blue-500/10 flex items-center justify-between">
            <div class="flex items-center space-x-2 text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <span>Active Task</span>
            </div>
            <div class="flex space-x-1 grayscale opacity-50">
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]"></div>
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.hasInputInitially || showInput" class="p-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-1 duration-200">
      <div class="flex items-end space-x-2 bg-white dark:bg-zinc-800 p-1.5 rounded-xl border border-black/10 dark:border-white/10 shadow-inner input-focus-ring transition-all duration-300">
        <textarea 
          v-model="input"
          :placeholder="data.hasInputInitially ? 'Ask a follow-up...' : 'Branch from here...'"
          class="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 py-1 px-1 resize-none overflow-hidden leading-relaxed"
          rows="1"
          @keydown.enter="handleEnter"
          @input="adjustTextarea"
          ref="textareaRef"
        ></textarea>
        <button 
          @click="submit"
          class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-600/20"
          :disabled="!input.trim()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps<{ data: any }>()
const videoStore = useVideoStore()
const input = ref('')
const showInput = ref(false)
const copiedId = ref<string | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const copyMessage = (id: string, content: string) => {
  navigator.clipboard.writeText(content).then(() => {
    copiedId.value = id
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null
    }, 2000)
  })
}

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
    showInput.value = false
    setTimeout(() => adjustTextarea(), 0)
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.3);
}
</style>
