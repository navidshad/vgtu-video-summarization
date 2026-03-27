<template>
  <div class="bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl min-w-[320px] border border-zinc-200/20 dark:border-zinc-700/50 group overflow-hidden">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <div class="flex items-center justify-between mb-3">
      <div class="text-[10px] font-bold uppercase tracking-wider text-green-400 opacity-80">Result: {{ data.type }}</div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="handleSave" class="p-1 hover:bg-white/10 rounded transition" title="Save Video">
          <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3m-1 7l-4 4-4-4m4 4V10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    
    <div v-if="data.type === 'summary'" class="text-sm text-zinc-200 leading-relaxed font-medium">
      {{ data.content }}
    </div>
    
    <div v-else-if="data.type === 'cover'" class="flex gap-2">
      <div v-for="(img, idx) in data.images" :key="idx" class="flex-1 aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-white/5 shadow-inner">
        <img :src="img" class="w-full h-full object-cover hover:scale-110 transition duration-500" />
      </div>
    </div>

    <div v-else-if="data.type === 'video'" class="relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video group/player">
      <video 
        ref="videoRef"
        :src="videoUrl" 
        class="w-full h-full object-contain"
        @click="togglePlay"
      ></video>
      <div v-if="!isPlaying" @click="togglePlay" class="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/20 transition">
        <div class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover/player:scale-110 transition duration-300">
           <svg class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    
    <button v-if="data.type === 'video'" @click="handleSave" class="mt-4 w-full py-2 px-4 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg">
      Download Summary Video
    </button>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{ data: any }>()
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)

const videoUrl = computed(() => {
  const file = props.data.files?.[0]
  if (!file) return null
  const url = file.url
  return url.startsWith('media://') ? url : `media://${url}`
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

const handleSave = async () => {
  const file = props.data.files?.[0]
  if (file && (window as any).api) {
    await (window as any).api.saveVideo(file.url)
  }
}
</script>

