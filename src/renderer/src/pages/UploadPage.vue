<template>
  <div class="h-screen flex flex-col bg-transparent transition-colors duration-300 overflow-hidden relative">
		<div class="container mx-auto px-6 py-12 max-w-7xl flex flex-col h-full z-10 relative">
			<!-- Header -->
      <PageHeader
        title="Video Summarizer"
        subtitle="Select a video to begin the AI analysis and extract key insights."
        :show-back="true"
      >
        <template #back>
          <IconButton @click="router.back()" icon="IconArrowLeft" size="sm" class="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md" />
        </template>
      </PageHeader>

      <div class="flex-1 overflow-y-auto -mx-6 px-6 pb-8 custom-scrollbar flex flex-col items-center">
        <!-- System Requirements Banners -->
        <div v-if="requirementsChecked && (!ffmpegAvailable || !scenedetectAvailable)" class="w-full max-w-2xl space-y-4 mb-8 animate-fade-in-up">
          <!-- FFmpeg missing: blocking error -->
          <div v-if="!ffmpegAvailable"
            class="flex items-start gap-4 px-5 py-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 backdrop-blur-sm">
            <div class="p-2 rounded-xl bg-red-500/20 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            </div>
           
            <div>
              <p class="font-bold text-base">FFmpeg not found</p>
              <p class="text-sm mt-1 opacity-90 leading-relaxed">FFmpeg is required for video processing. Please install it and restart the app.</p>
            </div>
          </div>

          <!-- Scenedetect missing: warning -->
          <div v-if="ffmpegAvailable && !scenedetectAvailable"
            class="flex items-start gap-4 px-5 py-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
             <div class="p-2 rounded-xl bg-amber-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
             </div>
            <div>
              <p class="font-bold text-base">scenedetect not found — Audio-only mode</p>
              <div class="text-sm mt-1 opacity-90 leading-relaxed space-y-2">
                <p>Visual scene analysis is unavailable. The AI will only analyze audio data.</p>
                <div class="flex items-center gap-2 mt-2">
                   <a href="https://github.com/navidshad/vgtu-video-summarization/blob/main/docs/setup.md#-external-tool-setup"
                  target="_blank" class="inline-flex items-center gap-1 font-bold hover:underline">
                  Installation guide 
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Upload Card -->
        <Card
          class="w-full max-w-2xl !rounded-[2.5rem] !bg-white/90 dark:!bg-zinc-900/90 backdrop-blur-xl border !border-zinc-200 dark:!border-zinc-700 p-1 flex flex-col shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 animate-fade-in-up transition-all duration-500"
          :class="{ '!border-primary/50 !bg-blue-50/50 dark:!bg-blue-500/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]': fileSelected }"
          style="animation-delay: 0.1s"
        >
          <div class="p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div v-if="!fileSelected" class="w-full h-full flex-1">
              <div @click="handleNativeSelect"
                class="w-full h-full min-h-[320px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-3xl flex flex-col items-center justify-center space-y-6 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-primary/50 cursor-pointer transition-all duration-300 group relative overflow-hidden">
                
                <div class="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>
                
                <div
                  class="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-primary transition-all duration-500 z-10 shadow-md group-hover:shadow-xl border border-zinc-100 dark:border-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </div>
                <div class="text-center z-10 space-y-2">
                  <h3 class="font-heading font-bold text-2xl text-zinc-900 dark:text-white">Choose a video</h3>
                  <p class="text-base text-zinc-600 dark:text-zinc-400 font-medium">Click to open system picker</p>
                </div>
              </div>
            </div>

            <div v-else class="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div
                class="flex items-center justify-between p-5 bg-zinc-100 dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
                <div class="flex items-center space-x-5">
                  <div
                    class="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm border border-zinc-100 dark:border-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m22 8-6 4 6 4V8Z" />
                      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-zinc-900 dark:text-white truncate max-w-[200px] text-xl mb-1">{{ fileName }}</p>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p class="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Ready to upload</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" @click="resetSelection" label="Change" outline class="!rounded-xl !bg-white dark:!bg-zinc-700 !border-zinc-200 dark:!border-zinc-600" />
              </div>

              <div class="space-y-3">
                 <label class="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">Instruction Prompt</label>
                <TextArea v-model="prompt"
                  placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')" :rows="4"
                  class="!bg-zinc-50 dark:!bg-zinc-800/50 !text-zinc-900 dark:!text-white !border-zinc-300 dark:!border-zinc-600 placeholder:text-zinc-400 !rounded-2xl transition-all focus:!border-primary/50 focus:!ring-4 focus:!ring-primary/10 resize-none shadow-sm" />
              </div>
             

              <!-- Tooltip wrapper for disabled state -->
              <div class="relative group/btn pt-2">
                <Button @click="startCreation" color="primary" :disabled="!canSubmit" label="Create Summary" size="lg" class="w-full !rounded-2xl !py-4 !text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]" />
                
                <!-- Tooltip shown when ffmpeg is missing -->
                <div v-if="!ffmpegAvailable"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-700 text-white text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  FFmpeg is required to process video
                  <div
                    class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button, IconButton, Card } from 'pilotui/elements'
import { TextArea } from 'pilotui/form'
import { MessageRole } from '@shared/types'
import { useVideoStore } from '../stores/videoStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const videoStore = useVideoStore()
const fileSelected = ref(false)
const fileName = ref('')
const filePath = ref('')
const prompt = ref('')

// System requirements state
const requirementsChecked = ref(false)
const ffmpegAvailable = ref(true)
const scenedetectAvailable = ref(true)

onMounted(async () => {
  try {
    const result = await (window as any).api?.checkSystemRequirements()
    if (result) {
      ffmpegAvailable.value = result.ffmpegAvailable
      scenedetectAvailable.value = result.scenedetectAvailable
    }
  } catch (e) {
    console.error('Failed to check system requirements:', e)
  } finally {
    requirementsChecked.value = true
  }
})

// Can only submit if ffmpeg is available and a file + prompt are ready
const canSubmit = computed(() => ffmpegAvailable.value && !!prompt.value.trim())

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
  if (fileSelected.value && prompt.value.trim() && ffmpegAvailable.value) {
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
