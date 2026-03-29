<template>
  <div class="bg-zinc-900/90 backdrop-blur-xl p-0 rounded-2xl shadow-2xl min-w-[280px] max-w-[320px] border border-green-500/20 overflow-hidden flex flex-col group transition-all duration-300 hover:border-green-500/50">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <div class="p-3 flex items-center justify-between border-b border-white/5 bg-zinc-800/50">
      <div class="flex items-center space-x-2">
        <div class="text-[9px] font-black uppercase tracking-widest text-green-400">Result: {{ data.type }}</div>
        
        <!-- Version Badge -->
        <div v-if="data.version" class="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[8px] font-bold text-blue-400 uppercase leading-none">
          V{{ data.version }}
        </div>

        <!-- File Type Badge -->
        <div v-if="fileTypeBadge" 
             class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase leading-none border"
             :class="[
               fileTypeBadge === 'actual' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
             ]"
        >
          {{ fileTypeBadge }}
        </div>
      </div>

      <button @click="handleSave" class="p-1 hover:bg-white/10 rounded transition text-zinc-400 hover:text-white" title="Save Video">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3m-1 7l-4 4-4-4m4 4V10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <!-- Summary Type -->
    <div v-if="data.type === 'summary'" class="p-3 text-xs text-zinc-200 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
      {{ data.content }}
    </div>
    
    <!-- Cover Type -->
    <div v-else-if="data.type === 'cover'" class="p-2 flex gap-1">
      <div v-for="(img, idx) in data.images" :key="idx" class="flex-1 aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-white/5 shadow-inner">
        <img :src="img" class="w-full h-full object-cover hover:scale-110 transition duration-500" />
      </div>
    </div>

    <!-- Video Type (Compact Player) -->
    <div v-else-if="data.type === 'video'" class="relative aspect-video bg-black group/player">
      <video 
        ref="videoRef"
        :src="videoUrl" 
        class="w-full h-full object-contain"
        @click="togglePlay"
      ></video>
      <div v-if="!isPlaying" @click="togglePlay" class="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/20 transition">
        <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover/player:scale-110 transition duration-300">
           <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    
    <!-- Branching Input -->
    <div class="p-3 bg-black/20 mt-auto">
      <div class="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all duration-300">
        <input 
          v-model="input"
          type="text" 
          placeholder="Adjust or follow up..."
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

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{ data: any }>()
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const input = ref('')

const videoUrl = computed(() => {
  const file = props.data.files?.[0]
  if (!file) return null
  const url = file.url
  return url.startsWith('media://') ? url : `media://${url}`
})

const fileTypeBadge = computed(() => {
  const file = props.data.files?.[0]
  return file ? file.type : null
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


