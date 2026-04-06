<template>
  <div class="glass-card glass-card-hover p-0 rounded-3xl min-w-[280px] max-w-[320px] overflow-hidden flex flex-col group transition-all duration-300">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-500 border-2 border-white dark:border-zinc-800" />
    
    <!-- Main Image Container -->
    <div class="relative aspect-video bg-black overflow-hidden group/player">
      <!-- Controls Overlay (Hover) -->
      <div class="absolute top-2 right-2 flex flex-col gap-2 z-20 opacity-0 group-hover/player:opacity-100 transition-opacity">
        <button v-if="mediaContentUrl" @click="isFullScreen = true" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 text-white transition-all shadow-lg" title="Full Screen View">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        </button>
        <button @click="showDetails = !showDetails" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 transition-all shadow-lg" :class="{'text-blue-400': showDetails, 'text-white': !showDetails}" title="Toggle Details">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
        <button @click="handleSave" class="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/80 text-white transition-all shadow-lg" title="Save Image">
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
           <div v-if="data.version" class="px-1 py-0 rounded bg-primary/30 border border-primary/50 text-[7px] font-black text-white uppercase leading-none mt-[-2px]">
             V{{ data.version }}
           </div>
        </div>
        <div class="flex items-center gap-2">
           <div class="text-[9px] font-black uppercase tracking-widest text-primary-light">Result: {{ displayType }}</div>
           <div class="px-1 py-0 rounded text-[7px] font-black uppercase leading-none border bg-accent/20 border-accent/40 text-accent-light">
             {{ activeFileType }}
           </div>
        </div>
      </div>

      <!-- Image Content -->
      <img 
        :src="mediaContentUrl" 
        class="w-full h-full object-contain cursor-pointer transition-transform duration-500 hover:scale-105" 
        @click="isFullScreen = true"
      />
    </div>

    <!-- Reference Frames Gallery (Visible by default if present) -->
    <div v-if="referenceFrames.length > 0" class="px-3 py-2 bg-black/10 dark:bg-black/40 border-b border-black/5 dark:border-white/5">
        <div class="flex items-center justify-between mb-2">
            <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500">{{ displayReferenceLabel }}</span>
            <span class="text-[8px] font-bold text-zinc-400">{{ referenceFrames.length }} detected</span>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth">
            <div 
                v-for="(frame, idx) in referenceFrames" 
                :key="idx"
                class="flex-shrink-0 w-16 aspect-video rounded-md overflow-hidden border transition-all cursor-pointer hover:border-primary/60 active:scale-95 group/ref"
                :class="[
                  previewUrl === mediaUrl(frame.url) ? 'border-primary ring-1 ring-primary/20 scale-95 shadow-lg' : 'border-black/10 dark:border-white/10 grayscale-[0.5] hover:grayscale-0'
                ]"
                @click="previewUrl = mediaUrl(frame.url)"
            >
                <img :src="mediaUrl(frame.url)" class="w-full h-full object-cover" />
            </div>
            <!-- Reset to actual toggle -->
             <div 
                v-if="previewUrl !== mediaUrl(actualFile?.url)"
                class="flex-shrink-0 w-16 aspect-video rounded-md overflow-hidden border border-accent/40 bg-accent/10 flex items-center justify-center cursor-pointer hover:bg-accent/20 transition-all text-accent-light group/reset"
                @click="previewUrl = mediaUrl(actualFile?.url)"
                title="Back to Generated Thumbnail"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M3 10h10a8 8 0 018 8v2M3 10l4 4m-4-4l4-4"></path></svg>
            </div>
        </div>
    </div>

    <!-- Details Metadata Section -->
    <div v-if="showDetails" class="px-4 py-3 bg-white/5 border-b border-white/5 space-y-4 animate-in slide-in-from-top duration-300">
      <div v-if="metadata || isMetadataLoading" class="grid grid-cols-2 gap-3 pb-4">
        <div v-if="isMetadataLoading" class="col-span-2 py-4 flex items-center justify-center space-x-2">
           <div class="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
           <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Loading Media Info...</span>
        </div>
        <template v-else-if="metadata">
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Resolution</span>
            <span class="text-[11px] text-zinc-700 dark:text-zinc-200 font-mono">{{ metadata?.width }}x{{ metadata?.height }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">File Size</span>
            <span class="text-[11px] text-zinc-700 dark:text-zinc-200 font-mono">{{ formatFileSize(metadata?.size) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Format</span>
            <span class="text-[11px] text-zinc-700 dark:text-zinc-200 font-mono uppercase">{{ (metadata?.format?.split(',')[0] || 'Image').replace('image2', 'PNG') }}</span>
          </div>
        </template>
      </div>
    </div>
    
    <BaseMessageInput 
      v-model="input"
      v-model:attachedImages="attachedImages"
      placeholder="Adjust or follow up..."
      compact
      class="p-2 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]"
      @send="submit"
    />

    <!-- Full Screen Modal -->
    <Teleport to="body">
      <div v-if="isFullScreen" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-300">
        <button @click="isFullScreen = false" class="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90 z-50">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <img :src="mediaContentUrl" class="max-w-full max-h-full rounded-2xl shadow-2xl ring-1 ring-white/20 object-contain" />
        <div class="mt-6 text-xl font-bold text-white opacity-80 italic tracking-tight">Result: Thumbnail (V{{ props.data.version || 1 }})</div>
      </div>
    </Teleport>

    <Handle type="source" :position="Position.Bottom" class="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-800" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import BaseMessageInput from '../chat/BaseMessageInput.vue'

const props = defineProps<{ data: any }>()
const isFullScreen = ref(false)
const showDetails = ref(false)
const input = ref('')
const attachedImages = ref<string[]>([])
const metadata = ref<any>(null)
const isMetadataLoading = ref(false)
const previewUrl = ref<string | null>(null)

const files = computed(() => props.data.files || [])
const actualFile = computed(() => files.value.find((f: any) => f.type === 'actual'))
const referenceFrames = computed(() => files.value.filter((f: any) => f.type === 'preview'))

const mediaUrl = (url?: string) => {
  if (!url) return ''
  return url.startsWith('media://') ? url : `media://${url}`
}

const mediaContentUrl = computed(() => {
  if (previewUrl.value) return previewUrl.value
  const file = actualFile.value || referenceFrames.value[0]
  return mediaUrl(file?.url)
})

const activeFileType = computed(() => {
    if (previewUrl.value) {
        if (previewUrl.value === mediaUrl(actualFile.value?.url)) return 'Actual'
        return 'Preview Reference'
    }
    return actualFile.value ? 'Actual' : 'Preview'
})

const displayType = computed(() => {
    const type = props.data.type || 'thumbnail'
    if (type === 'image' || type === 'result-image') return 'Image Result'
    return 'Thumbnail'
})

const displayReferenceLabel = computed(() => {
    const type = props.data.type || 'thumbnail'
    if (type === 'image' || type === 'result-image') return 'Reference Images'
    return 'Reference Frames'
})

const versionedTitle = computed(() => {
  const type = props.data.type || 'thumbnail'
  if (type === 'image' || type === 'result-image') return 'AI Generated Image'
  return 'AI Generated Thumbnail'
})

const fetchMetadata = async () => {
  if (!mediaContentUrl.value || metadata.value || isMetadataLoading.value) return
  isMetadataLoading.value = true
  try {
    const rawPath = mediaContentUrl.value.replace('media://', '')
    metadata.value = await (window as any).api.getVideoMetadata(rawPath)
  } catch (e) {
    console.error('Failed to fetch image metadata:', e)
  } finally {
    isMetadataLoading.value = false
  }
}

watch(showDetails, (newVal) => {
  if (newVal) fetchMetadata()
}, { immediate: true })

const handleSave = async () => {
  const url = previewUrl.value || mediaUrl(actualFile.value?.url)
  if (url && (window as any).api) {
    await (window as any).api.saveVideo(url.replace('media://', ''))
  }
}

const submit = (text: string, images: string[]) => {
  if ((text.trim() || images.length > 0) && props.data.onSubmit) {
    props.data.onSubmit(text, images)
    input.value = ''
    attachedImages.value = []
  }
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${mb.toFixed(1)} MB`
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
</style>
