<template>
  <div class="flex h-full bg-zinc-950 font-sans">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col p-8 relative">
      <!-- System State (Top Leftish) -->
      <div class="mb-12">
        <div class="inline-flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 shadow-xl">
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span class="text-zinc-200 font-medium">System State: {{ currentState }}</span>
        </div>
      </div>

      <!-- Video Preview Card -->
      <div class="w-[400px] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div class="aspect-video bg-zinc-950 flex items-center justify-center group cursor-pointer">
          <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            <div class="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
          </div>
        </div>
        <div class="flex divide-x divide-zinc-800">
          <button class="flex-1 py-4 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium">Edit</button>
          <button class="flex-1 py-4 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium">Render Final</button>
        </div>
      </div>

      <!-- Chat Input Area (Fixed Bottom) -->
      <div class="absolute bottom-12 left-8 right-8">
        <div class="max-w-4xl mx-auto flex items-end space-x-6">
          <button class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <div class="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <textarea 
              placeholder="Ask me anything about the video..."
              class="w-full bg-transparent border-none appearance-none outline-none resize-none px-2 pt-2 text-zinc-200 h-16"
            ></textarea>
            <div class="flex justify-end">
              <button class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar (Messages) -->
    <div class="w-[450px] border-l border-zinc-800 p-8 flex flex-col space-y-6 overflow-y-auto">
      <div v-for="(msg, i) in messages" :key="i" 
        class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in slide-in-from-right-4 duration-500"
      >
        <p class="text-zinc-200 leading-relaxed">{{ msg }}</p>
      </div>
      
      <div v-if="videoReady" class="bg-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-500/20 animate-in zoom-in-95 duration-700">
        <h3 class="font-bold text-lg mb-2">Success!</h3>
        <p class="text-blue-50) text-zinc-100">Your video summary is ready for review.</p>
        <div class="mt-4 aspect-video bg-zinc-950/40 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentState = ref('Initializing...')
const messages = ref<string[]>([])
const videoReady = ref(false)

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
