<template>
  <div class="bg-zinc-900/90 backdrop-blur-xl p-0 rounded-2xl shadow-2xl min-w-[280px] max-w-[320px] border border-white/10 overflow-hidden flex flex-col group transition-all duration-300 hover:border-blue-500/50">
    <Handle v-if="data.hasInput !== false" type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Video Preview Section -->
    <div class="relative aspect-video bg-black overflow-hidden group/player">
      <video 
        v-if="videoUrl"
        ref="videoRef"
        :src="videoUrl" 
        class="w-full h-full object-cover opacity-60 group-hover/player:opacity-100 transition-opacity"
        muted
        loop
        @mouseenter="playPreview"
        @mouseleave="pausePreview"
      ></video>
      <div v-else class="w-full h-full flex items-center justify-center text-zinc-700">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </div>
      
      <!-- Full Screen Toggle Overlay -->
      <button 
        v-if="videoUrl"
        @click="isFullScreen = true" 
        class="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-lg opacity-0 group-hover/player:opacity-100 transition-opacity hover:bg-black/80"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
      </button>

      <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div class="text-xs font-bold text-white truncate">{{ data.filename || 'Original Video' }}</div>
        <div class="text-[9px] text-zinc-400 uppercase tracking-widest font-black mt-0.5">Source Media</div>
      </div>
    </div>

    <!-- Background Tasks Progress -->
    <div v-if="activeTasks.length > 0" class="p-3 bg-white/5 border-b border-white/5 space-y-2">
      <div v-for="task in activeTasks" :key="task.id" class="text-[10px]">
        <div class="flex justify-between items-center mb-1 text-zinc-400">
          <span class="truncate pr-2 font-bold uppercase tracking-tight">{{ task.name }}</span>
          <span>{{ task.progress !== undefined ? `${task.progress}%` : '' }}</span>
        </div>
        <div class="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${task.progress}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Branching Input -->
    <div class="p-3 bg-black/20">
      <div class="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all duration-300">
        <input 
          v-model="input"
          type="text" 
          placeholder="Start a new analysis..."
          class="flex-1 bg-transparent border-none text-[11px] focus:ring-0 text-zinc-200 placeholder:text-zinc-500 py-1 px-1"
          @keyup.enter="submit"
        />
        <button 
          @click="submit"
          class="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-all"
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
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{ data: any }>()
const videoStore = useVideoStore()
const input = ref('')
const isFullScreen = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

const videoUrl = computed(() => {
  const path = props.data.videoPath
  if (!path) return null
  return path.startsWith('media://') ? path : `media://${path}`
})

const activeTasks = computed(() => {
  return Object.values(videoStore.backgroundTasks || {})
    .filter(t => t.state === 'running' || t.state === 'pending')
})

const playPreview = () => videoRef.value?.play()
const pausePreview = () => videoRef.value?.pause()

const submit = () => {
  if (input.value.trim() && props.data.onSubmit) {
    props.data.onSubmit(input.value)
    input.value = ''
  }
}
</script>

