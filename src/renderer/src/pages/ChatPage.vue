<template>
  <div class="h-full flex flex-col bg-transparent overflow-hidden text-zinc-900 dark:text-zinc-200 transition-colors">
    <!-- Header: Simple -->
    <header
      class="py-4 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md z-10">
      <div class="flex items-center space-x-4">
        <button @click="handleBack"
          class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div
          class="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm dark:shadow-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xs font-bold tracking-tight text-zinc-900 dark:text-white uppercase tracking-widest">{{
            videoStore.currentVideoName ||
            'AI Video Assistant' }}</h2>
        </div>
      </div>
    </header>

    <!-- Chat Messages Stack -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-8">
        <div v-for="(msg, i) in videoStore.messages" :key="i"
          class="flex flex-col animate-in slide-in-from-bottom-4 duration-500"
          :class="msg.role === MessageRole.User ? 'items-end' : 'items-start'">

          <!-- Role Indicator -->
          <div class="flex items-center space-x-2 mb-2 px-1"
            :class="msg.role === MessageRole.User ? 'flex-row-reverse space-x-reverse' : 'flex-row'">
            <span class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {{ msg.role === MessageRole.User ? 'You' : 'AI Assistant' }}
            </span>
          </div>

          <!-- Message Content Wrapper (Text + Attachments) -->
          <div class="relative group flex flex-col gap-2 w-full"
            :class="msg.role === MessageRole.User ? 'items-end' : 'items-start'">

            <!-- Edit Button for AI Messages -->
            <button v-if="msg.role === MessageRole.AI && !msg.isPending" @click="startEditing(msg.id)"
              class="absolute left-full top-0 ml-4 flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10"
              title="Branch from this result">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.2 6 3 11l-.9-2.4c-.5-1.1.2-2.4 1.3-2.9l13.2-4.8c1.1-.5 2.4.2 2.9 1.3l.7 1.8z" />
                <path d="m6.2 5.3 3.1 3.9" />
                <path d="m12.4 3.4 3.1 4" />
                <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              </svg>
              <span>Edit this version</span>
            </button>

            <!-- Text Message Bubble -->
            <Card :class="[
              '!rounded-2xl !p-4 shadow-sm dark:shadow-xl transition-colors w-fit max-w-[450px]',
              msg.role === MessageRole.User
                ? '!bg-zinc-100 dark:!bg-zinc-100 !text-zinc-900 !border-0'
                : '!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-zinc-200 border !border-zinc-200 dark:!border-zinc-800',
              msg.isPending ? 'opacity-80' : ''
            ]">
              <div class="flex items-start space-x-3">
                <div v-if="msg.isPending" class="mt-1">
                  <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
                <div class="space-y-4 w-full">
                  <div class="flex flex-col gap-1">
                    <p class="text-[14px] leading-relaxed">{{ msg.content }}</p>
                    <div v-if="msg.role === MessageRole.AI && !msg.isPending" class="flex justify-end">
                      <span
                        class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">v.{{
                          msg.id.slice(0, 4) }}</span>
                    </div>
                  </div>

                  <!-- Results Section: Timeline + Video Layout -->
                  <div v-if="(msg.timeline && msg.timeline.length > 0) || (msg.files && msg.files.length > 0)"
                    class="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-6">

                    <!-- Video Section (Left Column on Large Screens) -->
                    <div v-if="msg.files && msg.files.length > 0" class="flex-1 space-y-3 min-w-0">
                      <template v-for="file in msg.files" :key="file.url">
                        <div
                          class="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
                          <!-- Video Preview -->
                          <div
                            class="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden group/video">
                            <video :src="getMediaUrl(file.url)" controls class="w-full h-full object-contain"
                              preload="metadata"></video>
                          </div>

                          <!-- Footer info for AI files -->
                          <div v-if="msg.role === MessageRole.AI"
                            class="p-3 flex items-center justify-between bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                            <div>
                              <h3
                                class="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest leading-none">
                                {{
                                  file.type ===
                                    FileType.Preview ? 'Preview Summary' : 'Final Summary' }}</h3>
                              <p class="text-[9px] text-zinc-500 font-medium mt-1 leading-none">{{ file.type ===
                                FileType.Preview ?
                                'Generating...' : 'Ready' }}</p>
                            </div>
                            <div class="flex gap-2">
                              <Button variant="primary" @click="handleSave(file.url)"
                                class="!px-3 !py-1 !h-auto text-[9px] font-bold uppercase tracking-widest">Save</Button>
                            </div>
                          </div>

                          <!-- Simple label for User files -->
                          <div v-else
                            class="px-2 py-1.5 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50">
                            <span class="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Original
                              Video</span>
                            <span class="text-[9px] font-bold text-blue-500 uppercase">{{ file.type }}</span>
                          </div>
                        </div>
                      </template>
                    </div>

                    <!-- Timeline Section (Stacked below Video) -->
                    <div v-if="msg.timeline && msg.timeline.length > 0" class="flex-1 min-w-0">
                      <button @click="toggleTimeline(msg.id)"
                        class="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group/toggle">
                        <span>Video Timeline</span>
                        <svg xmlns="http://www.w3.org/2000/svg"
                          class="w-3.5 h-3.5 transition-transform duration-300 transform"
                          :class="expandedTimelines.has(msg.id) ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      <div v-if="expandedTimelines.has(msg.id)"
                        class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div v-for="(item, idx) in msg.timeline" :key="idx"
                          class="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm">
                          <span
                            class="font-mono text-blue-500 font-medium whitespace-nowrap text-[11px] leading-tight shrink-0">
                            {{ item.start }} <br> {{ item.end }}
                          </span>
                          <span class="text-zinc-700 dark:text-zinc-300 leading-snug">{{ item.text }}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </Card>


          </div>
        </div>
      </div>
    </main>

    <!-- Chat Input: Central Bottom -->
    <footer
      class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20">
      <div class="max-w-4xl mx-auto flex flex-col space-y-2">
        <!-- Replying To Indicator -->
        <div v-if="editingMessageId"
          class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 text-sm">
          <div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span class="font-medium">Branching from previous result</span>
          </div>
          <button @click="cancelEdit" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="flex items-end space-x-4">
          <!-- Main Input area using Textarea -->
          <div class="flex-1 relative group">
            <TextArea v-model="userPrompt" placeholder="Ask a follow-up question..." :rows="2"
              class="!bg-white dark:!bg-zinc-900 border !border-zinc-200 dark:!border-zinc-800 !rounded-3xl shadow-lg dark:shadow-2xl !p-4 focus-within:!border-blue-500/50 transition-all text-sm resize-none pr-16 custom-scrollbar !text-zinc-900 dark:!text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600" />

            <!-- Send Button (Circular) -->
            <div class="absolute right-4 bottom-4">
              <Button variant="primary" @click="sendMessage"
                class="!rounded-full w-12 h-12 !p-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, Button } from '@codebridger/lib-vue-components/elements'
import { TextArea } from '@codebridger/lib-vue-components/form'
import { MessageRole, FileType } from '@shared/types'
import { useVideoStore } from '../stores/videoStore'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const userPrompt = ref('')
const scrollContainer = ref<HTMLElement | null>(null)
const editingMessageId = ref<string | null>(null)
const expandedTimelines = ref<Set<string>>(new Set())

const toggleTimeline = (messageId: string) => {
  if (expandedTimelines.value.has(messageId)) {
    expandedTimelines.value.delete(messageId)
  } else {
    expandedTimelines.value.add(messageId)
  }
}

const handleBack = () => {
  router.push('/home')
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const startEditing = (messageId: string) => {
  editingMessageId.value = messageId
  // Optionally maintain the user prompt or clear it? 
  // User wants to "provide new prompt".
  // Let's focus the textarea
  const textarea = document.querySelector('textarea')
  textarea?.focus()
}

const cancelEdit = () => {
  editingMessageId.value = null
}

// Auto-scroll when new messages arrive
watch(() => videoStore.messages.length, scrollToBottom)

const sendMessage = async () => {
  if (!userPrompt.value.trim()) return

  // The store action handles adding to current thread
  await videoStore.addMessage(userPrompt.value, MessageRole.User)

  // Capture the context ID *before* clearing it
  const contextId = editingMessageId.value

  // Reset UI state
  userPrompt.value = ''
  editingMessageId.value = null

  if (videoStore.currentThreadId) {
    // Pass the captured context ID (if any) to startProcessing
    await videoStore.startProcessing(videoStore.currentThreadId, contextId || undefined)
  }
}

const handleSave = async (filePath: string) => {
  try {
    // @ts-ignore - api is exposed via preload
    await window.api.saveVideo(filePath)
  } catch (error) {
    console.error('Failed to save video:', error)
  }
}

const getMediaUrl = (path: string) => {
  if (!path) return ''
  // Use the custom media:// protocol. With standard: true, it expects media://path
  // If path is absolute /Users/..., it becomes media:///Users/...
  return `media://${path}`
}

onMounted(async () => {
  const threadId = route.params.id as string
  if (threadId) {
    await videoStore.selectThread(threadId)
    // If we just created it and it has 1 message (user), start processing
    if (videoStore.messages.length === 1 && videoStore.messages[0].role === MessageRole.User) {
      videoStore.startProcessing(threadId)
    }
  }

  scrollToBottom()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}


:deep(.form-textarea) {
  border-radius: 1.5rem !important;
  border-color: #e4e4e7 !important;
  /* zinc-200 */
}

:global(.dark) :deep(.form-textarea) {
  border-color: #27272a !important;
  /* zinc-800 */
}

:deep(.form-textarea:focus) {
  border-color: rgba(59, 130, 246, 0.5) !important;
}
</style>