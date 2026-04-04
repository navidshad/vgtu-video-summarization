<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-zinc-950/40" @click="$emit('update:modelValue', false)"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-white">Add Attachments</h3>
          <button @click="$emit('update:modelValue', false)" class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <IconClose class="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-zinc-100 dark:border-zinc-800">
          <button 
            @click="activeTab = 'upload'"
            class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'"
          >
            Upload from Computer
          </button>
          <button 
            v-if="hasReferenceFrames"
            @click="activeTab = 'library'"
            class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'"
          >
            Project Frames
          </button>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <!-- Upload Tab -->
          <div v-if="activeTab === 'upload'" class="h-full flex flex-col items-center justify-center space-y-4 py-8">
            <div @click="triggerFileUpload" class="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
              <div class="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <IconUpload class="w-6 h-6 text-zinc-500 group-hover:text-primary" />
              </div>
              <p class="text-sm font-bold text-zinc-900 dark:text-white">Click to select images</p>
              <p class="text-xs text-zinc-500 mt-1">Supports JPG, PNG, WEBP (Up to 200 images)</p>
            </div>
          </div>

          <!-- Library Tab -->
          <div v-else-if="activeTab === 'library'" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div 
              v-for="(frame, index) in referenceFrames" 
              :key="index"
              class="relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all"
              :class="isSelected(frame) ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'"
              @click="toggleSelection(frame)"
            >
              <img :src="normalizeUrl(frame)" class="w-full h-full object-cover" />
              <div v-if="isSelected(frame)" class="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div class="bg-primary text-white p-1 rounded-full shadow-lg">
                  <IconCheck class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="text-xs text-zinc-500">
            {{ selectedCount }} items selected
          </div>
          <div class="flex space-x-3">
            <button @click="$emit('update:modelValue', false)" class="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              @click="confirmSelection" 
              class="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
              :disabled="selectedCount === 0"
            >
              Add Samples
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'select'])

const videoStore = useVideoStore()
const activeTab = ref<'upload' | 'library'>('upload')
const tempSelected = ref<string[]>([])

const referenceFrames = computed(() => videoStore.currentThread?.preprocessing?.['reference-frames'] || [])
const hasReferenceFrames = computed(() => referenceFrames.value.length > 0)

const selectedCount = computed(() => tempSelected.value.length)

const normalizeUrl = (url: string) => {
  return url.startsWith('media://') ? url : `media://${url}`
}

const isSelected = (url: string) => tempSelected.value.includes(url)

const toggleSelection = (url: string) => {
  const index = tempSelected.value.indexOf(url)
  if (index === -1) {
    tempSelected.value.push(url)
  } else {
    tempSelected.value.splice(index, 1)
  }
}

const triggerFileUpload = async () => {
  // Use Electron's native file picker via IPC
  const result = await (window as any).api.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
  })

  if (result && !result.canceled && result.filePaths.length > 0) {
    emit('select', result.filePaths)
    emit('update:modelValue', false)
    tempSelected.value = []
  }
}

const confirmSelection = () => {
  emit('select', [...tempSelected.value])
  emit('update:modelValue', false)
  tempSelected.value = []
}

// Icons (Inlined for simplicity or you can import from existing icon set if available)
const IconClose = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' }
const IconUpload = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>' }
const IconCheck = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' }
</script>
