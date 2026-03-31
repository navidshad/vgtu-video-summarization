<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[280px] max-w-[320px] overflow-hidden flex flex-col group transition-all duration-300">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Media Container with Overlays -->
    <div class="relative aspect-video bg-black overflow-hidden group/player">
      <!-- Controls Overlay (Hover) -->
      <div class="absolute top-2 right-2 flex flex-col gap-2 z-20 opacity-0 group-hover/player:opacity-100 transition-opacity">
        <button v-if="mediaContentUrl" @click="isFullScreen = true" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 text-white transition-all shadow-lg" title="Full Screen View">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        </button>
        <button @click="showDetails = !showDetails" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 transition-all shadow-lg" :class="{'text-blue-400': showDetails, 'text-white': !showDetails}" title="Toggle Details">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
        <button @click="handleSave" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 text-white transition-all shadow-lg" title="Save Video">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3m-1 7l-4 4-4-4m4 4V10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button @click="data.onDelete" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-red-500/80 text-white transition-all shadow-lg" title="Delete node and branches">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      <!-- Text Overlay (Bottom Left) -->
      <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div class="flex items-center gap-2 mb-0.5">
           <div class="text-xs font-bold text-white truncate max-w-[180px] italic">AI Result: {{ versionedTitle }}</div>
           <!-- Version Badge -->
           <div v-if="data.version" class="px-1 py-0 rounded bg-primary/30 border border-primary/50 text-[7px] font-black text-white uppercase leading-none mt-[-2px]">
             V{{ data.version }}
           </div>
        </div>
        <div class="flex items-center gap-2">
           <div class="text-[9px] font-black uppercase tracking-widest" :class="data.type === 'thumbnail' ? 'text-primary-light' : 'text-accent-light'">Result: {{ data.type }}</div>
            <!-- File Type Badge -->
            <div v-if="fileTypeBadge" 
                 class="px-1 py-0 rounded text-[7px] font-black uppercase leading-none border"
                 :class="[
                   fileTypeBadge === 'actual' ? 'bg-accent/20 border-accent/40 text-accent-light' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                 ]"
            >
              {{ fileTypeBadge }}
            </div>
        </div>
      </div>

      <!-- Summary Content -->
      <div 
        v-if="data.type === 'summary'" 
        v-html="renderMarkdown(data.content)"
        class="w-full h-full p-4 pb-12 text-[10px] text-zinc-800 dark:text-zinc-200 leading-relaxed overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0 opacity-80 group-hover/player:opacity-100 transition-opacity"
      ></div>
    
      <!-- Cover Images -->
      <div v-else-if="data.type === 'cover'" class="w-full h-full p-2 flex gap-1 opacity-60 group-hover/player:opacity-100 transition-opacity">
        <div v-for="(img, idx) in data.images" :key="idx" class="flex-1 aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-white/5 shadow-inner">
          <img :src="img" class="w-full h-full object-cover hover:scale-110 transition duration-500" />
        </div>
      </div>

      <!-- Thumbnail Sections -->
      <div v-else-if="files && files.length > 0 && (data.type === 'thumbnail' || data.type === 'generate-thumbnail')" class="w-full h-full flex flex-col group/thumbnail opacity-60 group-hover/player:opacity-100 transition-opacity">
         <img :src="mediaUrl(files[0].url)" class="w-full h-full object-contain" />
      </div>

      <!-- Video Content -->
      <div v-else-if="isVideo" class="w-full h-full relative">
        <video 
          ref="videoRef"
          :src="mediaContentUrl" 
          class="w-full h-full object-contain opacity-60 group-hover/player:opacity-100 transition-opacity"
          @click="togglePlay"
        ></video>
        <div v-if="!isPlaying" @click="togglePlay" class="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/20 transition">
          <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover/player:scale-110 transition duration-300">
             <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Metadata Section (Bottom placement like original) -->
    <div v-if="showDetails" class="px-4 py-3 bg-white/5 border-b border-white/5 space-y-4 animate-in slide-in-from-top duration-300">
      <!-- Technical Summary Grid -->
      <div class="grid grid-cols-2 gap-3 pb-2 border-b border-white/5">
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Node Cost</span>
          <span class="text-[11px] text-green-400 font-mono italic">${{ props.data.cost?.toFixed(4) || '0.0000' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Result Type</span>
          <span class="text-[11px] text-zinc-300 capitalize">{{ props.data.type }}</span>
        </div>
        <div v-if="props.data.version" class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Version</span>
          <span class="text-[11px] text-primary font-mono">V{{ props.data.version }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
          <span class="text-[11px] text-zinc-400 italic">Ready</span>
        </div>
      </div>

      <!-- Reference Frames (for Images) -->
      <div v-if="isImage && referenceFrames.length > 0" class="space-y-2">
        <div class="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Source Materials (Reference Frames)</div>
        <div class="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2">
          <div v-for="(file, idx) in referenceFrames" :key="idx" class="flex-shrink-0 w-20 aspect-video bg-black rounded border border-white/5 overflow-hidden group/frame relative shadow-lg">
             <img :src="mediaUrl(file.url)" class="w-full h-full object-cover opacity-70 group-hover/frame:opacity-100 transition duration-300" />
             <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/frame:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      <!-- Timeline segments (for Videos) -->
      <div v-if="isVideo && props.data.timeline?.length > 0" class="space-y-2">
        <div class="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Timeline Segments Map</div>
        <div class="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
          <div v-for="(segment, idx) in props.data.timeline" :key="idx" class="p-2 bg-black/40 rounded-lg border border-white/5 hover:border-blue-500/20 transition-all flex flex-col gap-1">
             <div class="flex justify-between items-center">
               <span class="text-[8px] font-black font-mono text-blue-400 opacity-80 decoration-blue-500/50 underline-offset-2 underline decoration-dashed">
                 [{{ formatTime(segment.start) }} - {{ formatTime(segment.end) }}]
               </span>
               <span class="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Segment {{ Number(idx) + 1 }}</span>
             </div>
             <div class="text-[9px] text-zinc-300 leading-tight italic">"{{ segment.text }}"</div>
             <div v-if="segment.visual" class="text-[8px] text-zinc-500 leading-tight mt-1 bg-white/5 p-1 rounded border border-white/5">
                <span class="font-bold opacity-50 uppercase text-[7px] mr-1">Visual:</span>
                {{ segment.visual }}
             </div>
          </div>
        </div>
      </div>
    </div>
    
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

    <!-- Full Screen Modal (Teleport to body) -->
    <Teleport to="body">
      <div v-if="isFullScreen" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-300">
        <button @click="isFullScreen = false" class="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <video v-if="isFullScreen && isVideo" :src="mediaContentUrl" controls autoplay class="max-w-full max-h-full rounded-2xl shadow-2xl ring-1 ring-white/20"></video>
        <img v-else-if="isFullScreen && isImage" :src="mediaContentUrl" class="max-w-full max-h-full rounded-2xl shadow-2xl ring-1 ring-white/20 object-contain" />
        <div class="mt-6 text-xl font-bold text-white opacity-80 italic tracking-tight">Result: {{ props.data.type }} (V{{ props.data.version || 1 }})</div>
      </div>
    </Teleport>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps<{ data: any }>()
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isFullScreen = ref(false)
const showDetails = ref(false)
const input = ref('')

const files = computed(() => props.data.files || [])

const mediaUrl = (url: string) => {
  if (!url) return ''
  return url.startsWith('media://') ? url : `media://${url}`
}

const mediaContentUrl = computed(() => {
  const file = files.value.find((f: any) => f.type === 'actual' || f.type === 'preview')
  if (!file || props.data.type === 'summary' || props.data.type === 'cover') return undefined
  return mediaUrl(file.url)
})

const isVideo = computed(() => props.data.type === 'video')
const isImage = computed(() => props.data.type === 'thumbnail' || props.data.type === 'generate-thumbnail')

const referenceFrames = computed(() => {
    if (!isImage.value) return []
    return files.value.slice(1)
})

const fileTypeBadge = computed(() => {
  const file = files.value[0]
  return file ? file.type : null
})

const versionedTitle = computed(() => {
  if (props.data.type === 'video') return 'Synthesized Clip'
  if (props.data.type === 'thumbnail') return 'AI Generated Thumbnail'
  if (props.data.type === 'summary') return 'Interactive Summary'
  return 'AI Generated Output'
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

const formatTime = (val?: string | number) => {
  if (val === undefined || val === null) return '00:00'
  
  if (typeof val === 'string') {
    // If it's already a timestamp like "00:00:05,200" or "00:01:23"
    const clean = val.trim().replace(',', '.')
    const parts = clean.split(':')
    if (parts.length === 3) {
      // HH:MM:SS.mmm -> MM:SS
      const ss = parts[2].split('.')[0]
      return `${parts[1]}:${ss}`
    }
    if (parts.length === 2) {
      // MM:SS.mmm -> MM:SS
      return parts[0] + ':' + parts[1].split('.')[0]
    }
    return val.split('.')[0]
  }

  const m = Math.floor(val / 60)
  const s = Math.floor(val % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
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


