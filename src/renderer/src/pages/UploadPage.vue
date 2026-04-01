<template>
  <div
    class="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden relative">
    <!-- Ambient Backgrounds -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>
    <div class="container mx-auto px-6 py-12 max-w-7xl flex flex-col h-full z-10 relative">
      <!-- Header -->
      <PageHeader title="Video Summarizer" subtitle="Select a video to begin the AI analysis and extract key insights."
        :show-back="true">
        <template #back>
          <IconButton @click="router.back()" icon="IconArrowLeft" size="sm"
            class="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md" />
        </template>
      </PageHeader>

      <div class="flex-1 overflow-y-auto -mx-6 px-6 pb-8 custom-scrollbar flex flex-col items-center">
        <!-- System Requirements Banners -->
        <div v-if="requirementsChecked && (!ffmpegAvailable || !scenedetectAvailable || isTempDirUnsafe)"
          class="w-full max-w-2xl space-y-4 mb-8">
          <!-- FFmpeg missing: blocking error -->
          <div v-if="!ffmpegAvailable"
            class="flex items-start gap-4 px-5 py-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 backdrop-blur-sm">
            <div class="p-2 rounded-lg bg-red-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div>
              <p class="font-bold text-base">FFmpeg not found</p>
              <p class="text-sm mt-1 opacity-90 leading-relaxed">FFmpeg is required for video processing. Please install
                it
                and restart the app.</p>
            </div>
          </div>

          <!-- Scenedetect missing: warning -->
          <div v-if="ffmpegAvailable && !scenedetectAvailable"
            class="flex items-start gap-4 px-5 py-4 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
            <div class="p-2 rounded-lg bg-amber-500/20 shrink-0">
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Unsafe Temp Dir: warning -->
          <div v-if="isTempDirUnsafe"
            class="flex items-start gap-4 px-5 py-4 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
            <div class="p-2 rounded-lg bg-amber-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-base">Unstable Storage Location</p>
              <div class="text-sm mt-1 opacity-90 leading-relaxed space-y-1">
                <p>The app is using a system temporary directory. Your project artifacts might be deleted by the OS
                  unexpectedly.</p>
                <button @click="router.push('/settings')" class="font-bold hover:underline">Go to Settings to change
                  it</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div v-if="!fileSelected && !isDownloading" class="flex bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl p-1.5 w-full max-w-sm mx-auto mb-6 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <button @click="uploadMode = 'local'" class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2" :class="uploadMode === 'local' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white scale-[1.02]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 scale-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            Local File
          </button>
          <button @click="uploadMode = 'link'" class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2" :class="uploadMode === 'link' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white scale-[1.02]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 scale-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Video Link
          </button>
        </div>

        <!-- Main Upload Card -->
        <Card
          class="w-full max-w-2xl !rounded-lg !bg-white/90 dark:!bg-zinc-900/90 backdrop-blur-xl border !border-zinc-200 dark:!border-zinc-700 p-1 flex flex-col shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 transition-all duration-500"
          :class="{ '!border-primary/50 !bg-blue-50/50 dark:!bg-blue-500/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]': fileSelected }">
          <div class="p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div v-if="!fileSelected" class="w-full h-full flex-1">
              <!-- Loading State -->
              <div v-if="isDownloading" class="w-full h-full min-h-[320px] rounded-lg flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div class="relative w-24 h-24 flex items-center justify-center mb-4">
                  <div class="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800"></div>
                  <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                </div>
                <div class="text-center space-y-2">
                  <h3 class="font-heading font-bold text-2xl text-zinc-900 dark:text-white">Downloading Video...</h3>
                  <p class="text-base text-zinc-600 dark:text-zinc-400 font-medium">This might take a few minutes depending on the file size and your network.</p>
                </div>
              </div>

              <!-- Local Upload -->
              <div v-else-if="uploadMode === 'local'" @click="handleNativeSelect"
                class="w-full h-full min-h-[320px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex flex-col items-center justify-center space-y-6 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-primary/50 cursor-pointer transition-all duration-300 group relative overflow-hidden animate-in fade-in zoom-in-95">

                <div class="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>

                <div class="w-24 h-24 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-primary transition-all duration-500 z-10 shadow-md group-hover:shadow-xl border border-zinc-100 dark:border-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

              <!-- URL Input -->
              <div v-else-if="uploadMode === 'link'" class="w-full h-full min-h-[320px] rounded-lg flex flex-col items-center justify-center space-y-6 p-8 animate-in fade-in zoom-in-95">
                
                <!-- yt-dlp missing warning -->
                <div v-if="!ytDlpAvailable" class="w-full max-w-md text-left flex items-start gap-3 px-4 py-3 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-sm mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span><strong>yt-dlp is not installed.</strong> Downloading videos from links requires yt-dlp to be installed on your system. Please install it and restart the application.</span>
                </div>

                <div class="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <div class="text-center space-y-2 mb-6 w-full">
                  <h3 class="font-heading font-bold text-2xl text-zinc-900 dark:text-white">Provide Video Link</h3>
                  <p class="text-base text-zinc-600 dark:text-zinc-400 font-medium">Supports YouTube, Google Drive, and direct media files.</p>
                </div>
                <div class="w-full max-w-md space-y-5">
                  <div class="relative">
                    <input v-model="videoUrl" type="url" placeholder="https://youtube.com/..." class="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner pr-12" @keyup.enter="handleLinkStep" :disabled="!ytDlpAvailable || isAnalyzing" />
                    <div v-if="isAnalyzing" class="absolute right-4 top-1/2 -translate-y-1/2">
                      <svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                  </div>

                  <!-- Resolution selection -->
                  <div v-if="availableResolutions.length > 0" class="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p class="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Select Quality</p>
                    <div class="flex flex-wrap gap-2">
                       <button v-for="res in availableResolutions" :key="res" @click="selectedResolution = res" class="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all" :class="selectedResolution === res ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-primary/50'">
                        {{ res }}p
                       </button>
                    </div>
                  </div>

                  <Button @click="handleLinkStep" color="primary" :label="availableResolutions.length > 0 ? `Download ${selectedResolution}p Video` : 'Check Link'" class="w-full !rounded-lg !py-3 font-bold shadow-xl shadow-primary/20" :disabled="!videoUrl || !ytDlpAvailable || isAnalyzing" />
                </div>
              </div>
            </div>

            <div v-else class="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div
                class="flex items-center justify-between p-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-inner">
                <div class="flex items-center space-x-5">
                  <div
                    class="w-16 h-16 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm border border-zinc-100 dark:border-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m22 8-6 4 6 4V8Z" />
                      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-zinc-900 dark:text-white truncate max-w-[200px] text-xl mb-1">{{ fileName
                      }}</p>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-lg bg-green-500 animate-pulse"></span>
                      <p class="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Ready to
                        upload
                      </p>
                    </div>
                  </div>
                </div>
                <Button size="sm" @click="resetSelection" label="Change" outline
                  class="!rounded-lg !bg-white dark:!bg-zinc-700 !border-zinc-200 dark:!border-zinc-600" />
              </div>

              <div class="space-y-3">
                <label class="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">Instruction Prompt</label>
                <TextArea v-model="prompt"
                  placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')"
                  :rows="4"
                  class="!bg-zinc-50 dark:!bg-zinc-800/50 !text-zinc-900 dark:!text-white !border-zinc-300 dark:!border-zinc-600 placeholder:text-zinc-400 !rounded-lg transition-all focus:!border-primary/50 focus:!ring-4 focus:!ring-primary/10 resize-none shadow-sm" />
              </div>


              <!-- Tooltip wrapper for disabled state -->
              <div class="relative group/btn pt-2">
                <Button @click="startCreation" color="primary" :disabled="!canSubmit" label="Create Summary" size="lg"
                  class="w-full !rounded-lg !py-4 !text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]" />

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

const uploadMode = ref<'local'|'link'>('local')
const videoUrl = ref('')
const isAnalyzing = ref(false)
const isDownloading = ref(false)
const availableResolutions = ref<string[]>([])
const selectedResolution = ref('')

// System requirements state
const requirementsChecked = ref(false)
const ffmpegAvailable = ref(true)
const scenedetectAvailable = ref(true)
const ytDlpAvailable = ref(true)
const isTempDirUnsafe = ref(false)

onMounted(async () => {
  try {
    const result = await (window as any).api?.checkSystemRequirements()
    if (result) {
      ffmpegAvailable.value = result.ffmpegAvailable
      scenedetectAvailable.value = result.scenedetectAvailable
      ytDlpAvailable.value = result.ytDlpAvailable !== false // default true just in case
      isTempDirUnsafe.value = result.isTempDirUnsafe
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

const handleLinkStep = async () => {
  if (!videoUrl.value || !ytDlpAvailable.value || isAnalyzing.value || isDownloading.value) return

  if (availableResolutions.value.length === 0) {
    // Stage 1: Analyze link
    try {
      isAnalyzing.value = true
      const res = await (window as any).api?.fetchVideoFormats(videoUrl.value)
      if (res && res.length > 0) {
        availableResolutions.value = res
        // Default to "mid res" (middle of the list which is sorted descending)
        const midIndex = Math.floor(res.length / 2)
        selectedResolution.value = res[midIndex]
      } else {
         availableResolutions.value = ['Best']
         selectedResolution.value = 'Best'
      }
    } catch (e: any) {
      console.error('Failed to fetch formats:', e)
       await (window as any).api?.showConfirmation({
        title: 'Analysis Failed',
        message: 'Could not analyze the link.',
        detail: e?.message || 'Please check the URL and try again.',
        type: 'error',
        buttons: ['OK']
      })
    } finally {
      isAnalyzing.value = false
    }
  } else {
    // Stage 2: Download
    try {
      isDownloading.value = true
      const result = await (window as any).api?.downloadVideo(videoUrl.value, selectedResolution.value)
      if (result && result.path) {
        fileName.value = result.name
        filePath.value = result.path
        fileSelected.value = true
      }
    } catch (e: any) {
      console.error('Failed to download video:', e)
      await (window as any).api?.showConfirmation({
        title: 'Download Failed',
        message: 'Could not download the video.',
        detail: e?.message || 'Please check the URL and try again.',
        type: 'error',
        buttons: ['OK']
      })
    } finally {
      isDownloading.value = false
    }
  }
}

const resetSelection = () => {
  fileSelected.value = false
  fileName.value = ''
  filePath.value = ''
  videoUrl.value = ''
  availableResolutions.value = []
  selectedResolution.value = ''
}

const startCreation = async () => {
  if (fileSelected.value && prompt.value.trim() && ffmpegAvailable.value) {
    // 1. Create a new thread
    const threadId = await videoStore.createThread(filePath.value, fileName.value)

    // 2. Add the user message
    const userMsgId = await videoStore.addMessage(prompt.value.trim(), MessageRole.User)

    // 3. Navigate to chat with thread ID
    router.push(`/chat/${threadId}`)

    // 4. Start the AI processing pipeline
    // Pass userMsgId so the AI response is correctly linked to it in the graph
    await videoStore.startProcessing(threadId, userMsgId)
  }
}
</script>

<style scoped>
/* Scoped styles if needed */
</style>
