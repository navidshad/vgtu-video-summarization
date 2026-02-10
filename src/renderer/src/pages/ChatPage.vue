<template>
  <div class="h-full bg-transparent p-8 relative overflow-hidden text-zinc-200">
    <!-- Top Left: System State using a Card container -->
    <div class="absolute top-8 left-8">
      <Card
        class="!bg-zinc-900/80 border !border-zinc-800 !rounded-xl !px-5 !py-3 shadow-xl backdrop-blur-md flex items-center space-x-3 transition-all duration-500">
        <div class="w-2.5 h-2.5 rounded-full"
          :class="currentState === 'Ready' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'"></div>
        <span class="font-medium text-sm tracking-wide">System State: {{ currentState }}</span>
      </Card>
    </div>

    <!-- Top Right: Messages Area -->
    <div class="absolute top-8 right-8 w-80 flex flex-col space-y-4 items-end">
      <!-- Chat Message Bubble using Card -->
      <Card v-for="(msg, i) in messages" :key="i"
        class="!bg-zinc-900 border !border-zinc-800 !rounded-2xl !p-4 shadow-lg animate-in slide-in-from-right-4 duration-500 max-w-full">
        <div class="flex flex-col space-y-1">
          <div class="h-1 w-12 bg-zinc-700 rounded-full mb-1"></div>
          <div class="h-1 w-16 bg-zinc-700 rounded-full opacity-50"></div>
          <p class="text-xs text-zinc-300 mt-2 leading-relaxed">{{ msg }}</p>
        </div>
      </Card>

      <!-- Playback Preview using Card -->
      <Card v-if="videoReady"
        class="!bg-zinc-900 border !border-zinc-800 !rounded-2xl !p-3 shadow-xl w-48 group cursor-pointer hover:!border-blue-500/50 transition-all animate-in zoom-in-95 duration-700">
        <div class="aspect-video bg-zinc-950 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="m7 4 12 8-12 8V4z" />
          </svg>
        </div>
      </Card>
    </div>

    <!-- Mid Left: Video Preview Card -->
    <div class="absolute top-1/2 -translate-y-1/2 left-8 flex flex-col space-y-4">
      <Card
        class="w-[380px] !bg-zinc-900/50 !rounded-[2.5rem] border !border-zinc-800/80 !p-1.5 shadow-2xl backdrop-blur-sm group">
        <div
          class="aspect-video bg-zinc-950 rounded-[2.2rem] flex items-center justify-center relative overflow-hidden shadow-inner">
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <!-- Eye Icon -->
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-zinc-300" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>
      </Card>

      <!-- Sub Buttons: Edit / Render Final -->
      <div class="flex items-center space-x-2 w-[380px] bg-zinc-900/30 p-1 rounded-2xl border border-zinc-800/50">
        <Button variant="ghost"
          class="flex-1 py-3 text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-white rounded-xl">Edit</Button>
        <div class="w-px h-6 bg-zinc-800"></div>
        <Button variant="ghost"
          class="flex-1 py-3 text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-white rounded-xl">Render
          Final</Button>
      </div>
    </div>

    <!-- Bottom: Central Chat Input -->
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
      <div class="flex items-center space-x-6">
        <!-- Attachment Icon -->
        <button
          class="w-14 h-14 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <!-- Main Input area using Textarea -->
        <div class="flex-1 relative group">
          <TextArea v-model="userPrompt" placeholder="Ask me anything about the video..." :rows="3"
            class="!bg-zinc-900/80 border !border-zinc-800 !rounded-[2rem] shadow-2xl !p-6 focus-within:!border-blue-500/50 transition-all text-sm resize-none pr-16" />
          <!-- Send Button (Circular) -->
          <div class="absolute right-4 bottom-4">
            <Button variant="primary"
              class="!rounded-full w-12 h-12 !p-0 flex items-center justify-center bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Button } from '@codebridger/lib-vue-components/elements'
import { TextArea } from '@codebridger/lib-vue-components/form'

const currentState = ref('Initializing...')
const messages = ref<string[]>([])
const videoReady = ref(false)
const userPrompt = ref('')

const states = [
  'Extracting frames...',
  'Analyzing scenes...',
  'Generating transcript...',
  'Synthesizing summary...',
  'Finalizing video render...'
]

const stateMessages = [
  'The system is currently extracting high-quality frames from your video file.',
  'AI is analyzing visual patterns and identifying key events in the footage.',
  'Generating an intelligent transcript of audio and visual elements.',
  'Almost there! Creating the final condensed summary of the video content.'
]

onMounted(() => {
  let step = 0
  const interval = setInterval(() => {
    if (step < states.length) {
      currentState.value = states[step]
      if (stateMessages[step]) {
        messages.value.push(stateMessages[step])
      }
      step++
    } else {
      videoReady.value = true
      currentState.value = 'Ready'
      clearInterval(interval)
    }
  }, 3000)
})
</script>

<style scoped>
/* Custom overrides to match wireframe exactly while using library components */
:deep(.form-textarea) {
  border-radius: 2rem !important;
  padding-right: 4rem !important;
}
</style>
