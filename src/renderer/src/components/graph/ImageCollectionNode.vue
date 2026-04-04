<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[300px] max-w-[340px] overflow-hidden flex flex-col group transition-all duration-300">
    <Handle v-if="data.hasInput !== false" type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Gallery Section -->
    <div class="p-4 bg-zinc-950/5 dark:bg-black/40 border-b border-black/5 dark:border-white/5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex flex-col">
          <div class="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black leading-none mb-1">Source Collection</div>
          <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">{{ data.filename || 'Project Images' }}</h3>
        </div>
        <div class="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
          {{ sourceImages.length }} Files
        </div>
      </div>

      <!-- Image Grid -->
      <div class="grid grid-cols-3 gap-2 py-1">
        <div 
          v-for="(img, idx) in visibleImages" 
          :key="idx"
          class="relative aspect-square rounded-xl overflow-hidden border border-black/5 dark:border-white/10 group/img cursor-pointer"
          @click="openLightbox(idx)"
        >
          <img :src="mediaUrl(img)" class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
          <div v-if="idx === 5 && sourceImages.length > 6" class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold font-mono">
            +{{ sourceImages.length - 6 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Tasks Progress -->
    <div v-if="activeTasks.length > 0" class="p-3 bg-white/5 border-b border-white/5 space-y-2">
      <div v-for="task in activeTasks" :key="task.id" class="text-[10px]">
        <div class="flex justify-between items-center mb-1 text-zinc-400">
          <span class="truncate pr-2 font-bold uppercase tracking-tight">{{ task.status || task.name }}</span>
          <span>{{ task.progress !== undefined ? `${task.progress}%` : '' }}</span>
        </div>
        <div class="h-1 w-full bg-zinc-800/50 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${task.progress}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Branching Input -->
    <div class="p-3 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
      <!-- Attached Images Preview -->
      <div v-if="attachedImages.length > 0" class="flex flex-wrap gap-1.5 px-1 pb-2">
        <div 
          v-for="(img, idx) in attachedImages" 
          :key="idx" 
          class="relative w-10 h-10 rounded-lg overflow-hidden group border border-zinc-200 dark:border-zinc-800"
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

      <div class="flex items-end space-x-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-xl border border-black/5 dark:border-white/5 input-focus-ring transition-all duration-300">
        <!-- Attachment Toggle -->
        <button 
          @click="showAttachmentModal = true"
          class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 hover:text-primary transition-all mb-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14m-7-7v14"/>
          </svg>
        </button>

        <textarea 
          v-model="input"
          ref="textareaRef"
          placeholder="Start a new analysis..."
          class="flex-1 bg-transparent border-none text-[11px] focus:ring-0 focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 py-1.5 px-1 resize-none max-h-[150px] overflow-y-auto custom-scrollbar leading-relaxed"
          rows="1"
          @input="adjustTextarea"
          @keydown.enter="handleEnter"
        ></textarea>
        <button 
          @click="submit"
          class="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-30 transition-all shadow-md shadow-primary/20 mb-0.5"
          :disabled="!input.trim() && attachedImages.length === 0"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <AttachmentModal 
      v-model="showAttachmentModal"
      @select="handleImagesSelected"
    />

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div v-if="lightboxIdx !== null" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-300">
        <button @click="lightboxIdx = null" class="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90 z-50">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <img :src="mediaUrl(sourceImages[lightboxIdx])" class="max-w-full max-h-[80vh] rounded-2xl shadow-2xl ring-1 ring-white/20 object-contain" />
        
        <div class="mt-8 flex items-center gap-6">
          <button @click="prevImg" class="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-20" :disabled="lightboxIdx === 0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div class="text-zinc-400 font-mono text-sm tracking-widest">{{ lightboxIdx + 1 }} / {{ sourceImages.length }}</div>
          <button @click="nextImg" class="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-20" :disabled="lightboxIdx === sourceImages.length - 1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </Teleport>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'
import AttachmentModal from '../chat/AttachmentModal.vue'

const props = defineProps<{ data: any }>()
const videoStore = useVideoStore()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showAttachmentModal = ref(false)
const attachedImages = ref<string[]>([])
const lightboxIdx = ref<number | null>(null)

const sourceImages = computed(() => videoStore.currentThread?.preprocessing?.sourceImages || [])
const visibleImages = computed(() => sourceImages.value.slice(0, 6))

const activeTasks = computed(() => {
  return Object.values(videoStore.backgroundTasks || {})
    .filter(t => t.state === 'running' || t.state === 'pending')
})

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

const openLightbox = (idx: number) => {
  lightboxIdx.value = idx
}

const prevImg = () => {
  if (lightboxIdx.value !== null && lightboxIdx.value > 0) lightboxIdx.value--
}

const nextImg = () => {
  if (lightboxIdx.value !== null && lightboxIdx.value < sourceImages.value.length - 1) lightboxIdx.value++
}

onMounted(() => {
  adjustTextarea()
})
</script>
