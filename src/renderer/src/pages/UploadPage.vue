<template>
  <div class="flex flex-col items-center justify-center h-full bg-transparent p-6 space-y-8 relative">
    <!-- Back Button -->
    <div class="absolute top-0 left-0 p-6">
      <IconButton @click="router.back()" icon="IconArrowLeft" size="xs"/>
    </div>

    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2 text-zinc-900 dark:text-white transition-colors">Video Summarizer</h1>
      <p class="text-zinc-500 dark:text-zinc-400 transition-colors">Select a video to begin the AI analysis</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center justify-center space-y-6 transition-all shadow-xl dark:shadow-none"
      :class="{ 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5': fileSelected }">

      <div v-if="!fileSelected" class="w-full">
        <div @click="handleNativeSelect"
          class="w-full h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all group">
          <div
            class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-lg text-zinc-900 dark:text-white">Choose a video</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">Standard system picker will open</p>
          </div>
        </div>
      </div>

      <div v-else class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div
          class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z" />
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">{{ fileName }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Ready to upload</p>
            </div>
          </div>
          <Button size="sm" @click="resetSelection" label="Change" />
        </div>

        <TextArea v-model="prompt"
          placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')" :rows="4"
          class="!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-white !border-zinc-200 dark:!border-zinc-700 placeholder:text-zinc-400" />

        <Button @click="startCreation" color="primary" :disabled="!prompt.trim()" label="Create Summary" class="w-full"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, IconButton } from 'pilotui/elements'
import { TextArea } from 'pilotui/form'
import { MessageRole } from '@shared/types'
import { useVideoStore } from '../stores/videoStore'

const router = useRouter()
const videoStore = useVideoStore()
const fileSelected = ref(false)
const fileName = ref('')
const filePath = ref('')
const prompt = ref('')

const handleNativeSelect = async () => {
  const result = await (window as any).api?.selectVideo()
  if (result) {
    fileName.value = result.name
    filePath.value = result.path
    fileSelected.value = true
  }
}

const resetSelection = () => {
  fileSelected.value = false
  fileName.value = ''
  filePath.value = ''
}

const startCreation = async () => {
  if (fileSelected.value && prompt.value.trim()) {
    // 1. Create a new thread
    const threadId = await videoStore.createThread(filePath.value, fileName.value)

    // 2. Add the user message
    await videoStore.addMessage(prompt.value.trim(), MessageRole.User)

    // 3. Navigate to chat with thread ID
    router.push(`/chat/${threadId}`)
  }
}
</script>

<style scoped>
/* Scoped styles if needed */
</style>
