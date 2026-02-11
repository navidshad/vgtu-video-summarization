<template>
  <div class="flex flex-col items-center justify-center h-full bg-transparent p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2 text-zinc-900 dark:text-white transition-colors">Video Summarizer</h1>
      <p class="text-zinc-500 dark:text-zinc-400 transition-colors">Select a video to begin the AI analysis</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center justify-center space-y-6 transition-all shadow-xl dark:shadow-none"
      :class="{ 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5': fileSelected }">
      
      <div v-if="!fileSelected" class="w-full">
        <div class="dark:text-white">
          <FileInputCombo
            accept="video/*"
            :multiple="false"
            :auto-upload="false"
            :max-files="1"
            title="Drop video here"
            description="Or click to browse video files"
            @file-select="handleFileSelect"
          />
        </div>
      </div>

      <div v-else class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            </div>
            <div>
              <p class="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">{{ fileName }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Ready to upload</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="resetSelection" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white">
            Change
          </Button>
        </div>

        <TextArea v-model="prompt"
          placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')" :rows="4" 
          class="!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-white !border-zinc-200 dark:!border-zinc-700 placeholder:text-zinc-400" />

        <Button @click="startCreation" variant="primary" :disabled="!prompt.trim()"
          class="w-full py-4 font-bold active:scale-[0.99] shadow-lg dark:shadow-blue-900/20">
          Create Summary
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@codebridger/lib-vue-components/elements'
import { TextArea, FileInputCombo } from '@codebridger/lib-vue-components/form'
import { useVideoStore } from '../stores/videoStore'

const router = useRouter()
const videoStore = useVideoStore()
const fileSelected = ref(false)
const fileName = ref('')
const prompt = ref('')

const handleFileSelect = (payload: { files: File[] }) => {
  if (payload.files && payload.files.length > 0) {
    const file = payload.files[0]
    fileName.value = file.name
    fileSelected.value = true
    videoStore.setVideoName(file.name)
  }
}

const resetSelection = () => {
  fileSelected.value = false
  fileName.value = ''
  videoStore.setVideoName('')
}

const startCreation = () => {
  if (fileSelected.value && prompt.value.trim()) {
    videoStore.clearMessages()
    videoStore.addMessage({
      role: 'user',
      content: prompt.value.trim(),
      files: [{ url: fileName.value, type: 'actual' }]
    })
    router.push('/chat')
  }
}
</script>

<style scoped>
:global(.dark) :deep(.text-gray-900) {
  color: #f4f4f5 !important;
}
:global(.dark) :deep(.text-gray-500) {
  color: #a1a1aa !important;
}
</style>
