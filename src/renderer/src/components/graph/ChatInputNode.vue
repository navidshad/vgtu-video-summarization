<template>
  <div class="glass-card glass-card-hover input-focus-ring p-3 rounded-2xl min-w-[320px] flex flex-col space-y-2">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <!-- Attached Images Preview -->
    <div v-if="attachedImages.length > 0" class="flex flex-wrap gap-1.5 px-1 pb-1">
      <div 
        v-for="(img, idx) in attachedImages" 
        :key="idx" 
        class="relative w-10 h-10 rounded-lg overflow-hidden group border border-zinc-200 dark:border-zinc-800Shadow-sm"
      >
        <img :src="mediaUrl(img)" class="w-full h-full object-cover" />
        <button 
          @click="removeAttachment(idx)"
          class="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="flex items-end space-x-2">
      <!-- Attachment Toggle -->
      <button 
        @click="showAttachmentModal = true"
        class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 hover:text-primary transition-all mb-0.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14m-7-7v14"/>
        </svg>
      </button>

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
        :disabled="!input.trim() && attachedImages.length === 0"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
      </button>
    </div>

    <AttachmentModal 
      v-model="showAttachmentModal"
      @select="handleImagesSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import AttachmentModal from '../chat/AttachmentModal.vue'

const props = defineProps<{ data: any }>()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showAttachmentModal = ref(false)
const attachedImages = ref<string[]>([])

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && (input.value.trim() || attachedImages.value.length > 0)) {
    e.preventDefault()
    submit()
  }
}

const handleImagesSelected = (images: string[]) => {
  attachedImages.value = [...attachedImages.value, ...images]
}

const removeAttachment = (index: number) => {
  attachedImages.value.splice(index, 1)
}

const mediaUrl = (url: string) => {
  if (!url) return ''
  return url.startsWith('media://') ? url : `media://${url}`
}

const submit = () => {
  if ((input.value.trim() || attachedImages.value.length > 0) && props.data.onSubmit) {
    props.data.onSubmit(input.value, attachedImages.value)
    input.value = ''
    attachedImages.value = []
    setTimeout(adjustTextarea, 0)
  }
}

onMounted(() => {
  adjustTextarea()
})
</script>
