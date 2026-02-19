<template>
  <div class="flex flex-col items-center justify-center h-full bg-transparent p-6 space-y-8 relative overflow-hidden">
    <!-- Back Button -->
    <div class="absolute top-0 left-0 p-8 z-50">
      <IconButton @click="router.back()" icon="IconArrowLeft" size="sm" class="!bg-white/50 dark:!bg-black/20 backdrop-blur-md border !border-white/20"/>
    </div>

    <div class="text-center z-10 animate-fade-in-up">
      <h1 class="text-4xl md:text-5xl font-heading font-black mb-4 text-zinc-900 dark:text-white transition-colors tracking-tight">Video Summarizer</h1>
      <p class="text-lg text-zinc-500 dark:text-zinc-400 transition-colors font-medium max-w-md mx-auto">Select a video to begin the AI analysis and extract key insights.</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-zinc-700/50 p-12 flex flex-col items-center justify-center space-y-8 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] animate-fade-in-up"
      style="animation-delay: 0.1s"
      :class="{ '!border-primary/50 bg-blue-50/50 dark:bg-blue-500/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]': fileSelected }">

      <div v-if="!fileSelected" class="w-full">
        <div @click="handleNativeSelect"
          class="w-full h-80 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center space-y-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-primary/50 cursor-pointer transition-all duration-300 group relative overflow-hidden">
          
          <div class="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>
          
          <div
            class="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:rotate-3 group-hover:text-primary transition-all duration-300 z-10 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <div class="text-center z-10">
            <h3 class="font-heading font-bold text-xl text-zinc-900 dark:text-white mb-2">Choose a video</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Click to open system picker</p>
          </div>
        </div>
      </div>

      <div v-else class="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div
          class="flex items-center justify-between p-5 bg-zinc-50/80 dark:bg-zinc-800/40 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z" />
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-zinc-900 dark:text-white truncate max-w-[200px] text-lg">{{ fileName }}</p>
              <p class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ready to upload</p>
            </div>
          </div>
          <Button size="sm" @click="resetSelection" label="Change" outline />
        </div>

        <TextArea v-model="prompt"
          placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')" :rows="4"
          class="!bg-zinc-50 dark:!bg-zinc-800/30 !text-zinc-900 dark:!text-white !border-zinc-200 dark:!border-zinc-700 placeholder:text-zinc-400 !rounded-2xl transition-all focus:!border-primary/50 focus:!ring-4 focus:!ring-primary/10" />

        <Button @click="startCreation" color="primary" :disabled="!prompt.trim()" label="Create Summary" size="lg" class="w-full !rounded-xl !py-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"/>
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
