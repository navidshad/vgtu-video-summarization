<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[280px] max-w-[320px] overflow-hidden flex flex-col group transition-all duration-300">
    <Handle v-if="data.hasInput !== false" type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Video Preview Section -->
    <div class="relative aspect-video bg-black overflow-hidden group/player">
      <video 
        v-if="videoUrl"
        ref="videoRef"
        :src="videoUrl" 
        class="w-full h-full object-cover opacity-60 group-hover/player:opacity-100 transition-opacity"
        @click="togglePlay"
      ></video>
      <div v-if="!isPlaying && videoUrl" @click="togglePlay" class="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/20 transition z-10">
        <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover/player:scale-110 transition duration-300">
           <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div v-else class="w-full h-full flex items-center justify-center text-zinc-700">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </div>
      
      <!-- Full Screen Toggle Overlay -->
      <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity">
        <button 
          v-if="videoUrl"
          @click="isFullScreen = true" 
          class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80"
          title="Full Screen"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        </button>
        <button 
          @click="showDetails = !showDetails" 
          class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80"
          :class="{'text-primary-light': showDetails}"
          title="Toggle Metadata"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div class="text-xs font-bold text-white truncate">{{ data.filename || 'Original Video' }}</div>
        <div class="text-[9px] text-zinc-400 uppercase tracking-widest font-black mt-0.5">Source Media</div>
      </div>
    </div>

    <!-- Metadata Details Section -->
    <div v-if="showDetails" class="px-4 py-3 bg-white/5 border-b border-white/5 space-y-2 animate-in slide-in-from-top duration-300">
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Resolution</span>
          <span class="text-[11px] text-zinc-200 font-mono">{{ metadata?.width }}x{{ metadata?.height }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Duration</span>
          <span class="text-[11px] text-zinc-200 font-mono">{{ formatDuration(metadata?.duration) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Frame Rate</span>
          <span class="text-[11px] text-zinc-200 font-mono">{{ metadata?.fps }} FPS</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">File Size</span>
          <span class="text-[11px] text-zinc-200 font-mono">{{ formatFileSize(metadata?.size) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Format</span>
          <span class="text-[11px] text-zinc-200 font-mono">{{ metadata?.format?.split(',')[0] }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Codec</span>
          <span class="text-[11px] text-zinc-200 font-mono capitalize">{{ metadata?.codec }}</span>
        </div>
      </div>
    </div>

    <!-- Background Tasks Progress -->
    <div v-if="activeTasks.length > 0" class="p-3 bg-white/5 border-b border-white/5 space-y-2">
      <div v-for="task in activeTasks" :key="task.id" class="text-[10px]">
        <div class="flex justify-between items-center mb-1 text-zinc-400">
          <span class="truncate pr-2 font-bold uppercase tracking-tight">{{ task.name }}</span>
          <span>{{ task.progress !== undefined ? `${task.progress}%` : '' }}</span>
        </div>
        <div class="h-1 w-full bg-zinc-800/50 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${task.progress}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Branching Input -->
    <div class="p-3 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
      <div class="flex items-end space-x-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-xl border border-black/5 dark:border-white/5 input-focus-ring transition-all duration-300">
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
          :disabled="!input.trim()"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Full Screen Modal (Teleport to body) -->
    <Teleport to="body">
      <div v-if="isFullScreen" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-300">
        <button @click="isFullScreen = false" class="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <video v-if="videoUrl" :src="videoUrl" controls autoplay class="max-w-full max-h-full rounded-2xl shadow-2xl ring-1 ring-white/20"></video>
        <div class="mt-6 text-xl font-bold text-white opacity-80 italic tracking-tight">{{ data.filename }}</div>
      </div>
    </Teleport>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{ data: any }>()
const videoStore = useVideoStore()
const input = ref('')
const isFullScreen = ref(false)
const isPlaying = ref(false)
const showDetails = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const metadata = computed(() => videoStore.currentThread?.videoMetadata)

const videoUrl = computed(() => {
  const path = props.data.videoPath
  if (!path) return null
  return path.startsWith('media://') ? path : `media://${path}`
})

const activeTasks = computed(() => {
  return Object.values(videoStore.backgroundTasks || {})
    .filter(t => t.state === 'running' || t.state === 'pending')
})

const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
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
    setTimeout(adjustTextarea, 0)
  }
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${mb.toFixed(1)} MB`
}

onMounted(() => {
  adjustTextarea()
})
</script>

