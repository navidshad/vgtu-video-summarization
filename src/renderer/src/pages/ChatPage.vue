<template>
  <div class="h-full flex flex-col bg-transparent overflow-hidden text-zinc-900 dark:text-zinc-200 transition-colors">
    <!-- Header: Simple -->
    <header class="p-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md z-10">
      <div class="flex items-center space-x-4">
        <button @click="handleBack" class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
            </svg>
        </button>
        <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm dark:shadow-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">{{ videoStore.currentVideoName || 'AI Video Assistant' }}</h2>
        </div>
      </div>
    </header>

    <!-- Chat Messages Stack -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-10">
        <div v-for="(msg, i) in videoStore.messages" :key="i"
          class="flex flex-col animate-in slide-in-from-bottom-4 duration-500"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'">

          <!-- Message Bubble -->
          <Card :class="[
            '!rounded-2xl !p-6 shadow-sm dark:shadow-xl max-w-[80%] transition-colors',
            msg.role === 'user'
              ? '!bg-zinc-100 dark:!bg-zinc-100 !text-zinc-900 !border-0'
              : '!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-zinc-200 border !border-zinc-200 dark:!border-zinc-800',
            msg.isPending ? 'opacity-80' : ''
          ]">
            <div class="flex items-start space-x-3">
              <div v-if="msg.isPending" class="mt-1">
                <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div class="space-y-4 w-full">
                <p class="text-[15px] leading-relaxed">{{ msg.content }}</p>

                <!-- Timeline Display -->
                <div v-if="msg.timeline" class="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Video Timeline</h4>
                  <div class="space-y-2">
                    <div v-for="(item, idx) in msg.timeline" :key="idx" 
                         class="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm">
                      <span class="font-mono text-blue-500 font-medium whitespace-nowrap">{{ item.time || item.timestamp }}</span>
                      <span class="text-zinc-700 dark:text-zinc-300">{{ item.description || item.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- Attachments (Videos) -->
          <div v-if="msg.files && msg.files.length > 0" class="mt-4 flex flex-col space-y-3"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'">
            <template v-for="file in msg.files" :key="file.url">
              <Card
                class="!bg-white dark:!bg-zinc-900/50 border !border-zinc-200 dark:!border-zinc-800 !p-1.5 shadow-md dark:shadow-2xl backdrop-blur-sm group cursor-pointer hover:!border-blue-500/30 transition-all overflow-hidden"
                :class="msg.role === 'user' ? 'w-80 !rounded-2xl' : 'w-[420px] !rounded-3xl !p-2'">

                <div class="aspect-video bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden"
                  :class="msg.role === 'user' ? 'rounded-xl' : 'rounded-2xl'">
                  <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>

                  <!-- Play/Preview Icon -->
                  <div
                    class="rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                    :class="msg.role === 'user' ? 'w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800' : 'w-16 h-16 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/20'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="text-zinc-500 dark:text-zinc-300"
                      :class="msg.role === 'user' ? 'w-5 h-5' : 'w-8 h-8 text-zinc-900 dark:text-white fill-current'" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <template v-if="msg.role === 'user'">
                        <path
                          d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                        <circle cx="12" cy="12" r="3" />
                      </template>
                      <template v-else>
                        <path d="m7 4 12 8-12 8V4z" />
                      </template>
                    </svg>
                  </div>
                </div>

                <!-- Footer info for AI files -->
                <div v-if="msg.role === 'ai'" class="p-4 flex items-center justify-between">
                  <div>
                    <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{{ file.type === 'preview' ?
                      'Preview Summary' :
                      'Final Summary' }}</h3>
                    <p class="text-[10px] text-zinc-500 font-medium">{{ file.type === 'preview' ? 'Generating...' :
                      'Ready for review'
                    }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button variant="ghost"
                      class="!px-3 !py-2 !h-auto text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Download</Button>
                    <Button variant="primary"
                      class="!px-4 !py-2 !h-auto text-[10px] font-bold uppercase tracking-widest">Open</Button>
                  </div>
                </div>

                <!-- Simple label for User files -->
                <div v-else class="px-2 py-2 flex justify-between items-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Original Video</span>
                  <span class="text-[10px] font-bold text-blue-500/70 capitalize">{{ file.type }}</span>
                </div>
              </Card>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- Chat Input: Central Bottom -->
    <footer class="p-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20">
      <div class="max-w-4xl mx-auto flex items-end space-x-4">
        <!-- Attachment Button -->
        <button
          class="w-14 h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all shadow-md dark:shadow-xl group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:rotate-12 transition-transform"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path
              d="M21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <!-- Main Input area using Textarea -->
        <div class="flex-1 relative group">
          <TextArea v-model="userPrompt" placeholder="Ask a follow-up question..." :rows="3"
            class="!bg-white dark:!bg-zinc-900 border !border-zinc-200 dark:!border-zinc-800 !rounded-3xl shadow-lg dark:shadow-2xl !p-6 focus-within:!border-blue-500/50 transition-all text-sm resize-none pr-16 custom-scrollbar !text-zinc-900 dark:!text-zinc-100" />

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
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, Button } from '@codebridger/lib-vue-components/elements'
import { TextArea } from '@codebridger/lib-vue-components/form'
import { useVideoStore } from '../stores/videoStore'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const userPrompt = ref('')
const scrollContainer = ref<HTMLElement | null>(null)

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

// Auto-scroll when new messages arrive
watch(() => videoStore.messages.length, scrollToBottom)

const sendMessage = async () => {
  if (!userPrompt.value.trim()) return
  // The store action handles adding to current thread
  await videoStore.addMessage(userPrompt.value, 'user')
  userPrompt.value = ''
  if (videoStore.currentThreadId) {
    await videoStore.startProcessing(videoStore.currentThreadId)
  }
}

onMounted(async () => {
  const threadId = route.params.id as string
  if (threadId) {
    await videoStore.selectThread(threadId)
    // If we just created it and it has 1 message (user), start processing
    if (videoStore.messages.length === 1 && videoStore.messages[0].role === 'user') {
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
  border-color: #e4e4e7 !important; /* zinc-200 */
}

:global(.dark) :deep(.form-textarea) {
  border-color: #27272a !important; /* zinc-800 */
}

:deep(.form-textarea:focus) {
  border-color: rgba(59, 130, 246, 0.5) !important;
}
</style>
