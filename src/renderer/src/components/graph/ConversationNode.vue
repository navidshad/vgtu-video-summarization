<template>
  <div class="bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-xl p-0 rounded-2xl shadow-2xl min-w-[320px] max-w-[420px] border border-white/20 dark:border-zinc-700/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Messages List (Extended height to avoid scroll conflicts with VueFlow) -->
    <div class="p-4 space-y-4 nowheel nodrag">
      <div v-for="msg in data.messages" :key="msg.id" 
           class="flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300"
           :class="msg.role === 'user' ? 'items-end' : 'items-start'">
        
        <div class="flex items-center space-x-2 px-1">
          <span class="text-[9px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500">{{ msg.role }}</span>
          <div v-if="msg.role === 'user'" @click="videoStore.retryMessage(msg.id)" class="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 uppercase">Retry</div>
        </div>

        <div 
          class="px-3 py-2 rounded-2xl text-sm leading-relaxed max-w-[90%] break-words relative overflow-hidden"
          :class="[
            msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20 font-medium' 
              : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-black/5 dark:border-white/5',
            msg.isPending ? 'ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 transition-all duration-1000 animate-pulse' : ''
          ]"
        >
          <div v-if="msg.isPending && !msg.content" class="text-zinc-400 italic font-medium flex items-center space-x-2">
             <span>AI is thinking...</span>
          </div>
          <div v-else>{{ msg.content }}</div>
          
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

    <!-- Integrated Input -->
    <div v-if="data.hasInput" class="p-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
      <div class="flex items-end space-x-2 bg-white dark:bg-zinc-800 p-1.5 rounded-xl border border-black/10 dark:border-white/10 shadow-inner focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        <textarea 
          v-model="input"
          placeholder="Ask a follow-up..."
          class="flex-1 bg-transparent border-none text-sm focus:ring-0 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 py-1 px-1 resize-none overflow-hidden"
          rows="1"
          @keydown.enter.prevent="submit"
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

const props = defineProps<{ data: any }>()
const videoStore = useVideoStore()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const submit = () => {
  if (input.value.trim() && props.data.onSubmit) {
    props.data.onSubmit(input.value)
    input.value = ''
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
