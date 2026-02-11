<template>
  <div class="flex flex-col items-center justify-center h-full bg-transparent p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2 text-white">Video Summarizer</h1>
      <p class="text-zinc-400">Select a video to begin the AI analysis</p>
    </div>

    <div
      class="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-800 p-12 flex flex-col items-center justify-center space-y-6 transition-all"
      :class="{ 'border-blue-500/50 bg-blue-500/5': fileSelected }">
      <div class="relative group">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200">
        </div>
        <Button @click="selectFile" variant="secondary"
          class="relative px-8 py-4 rounded-full flex items-center space-x-3 text-zinc-100 font-semibold">
          <span v-if="!fileSelected">Select Video File</span>
          <span v-else class="text-blue-400">{{ fileName }}</span>
        </Button>
      </div>

      <div v-if="fileSelected" class="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TextArea v-model="prompt"
          placeholder="What would you like to focus on in this summary? (e.g. 'Summarize key takeaways')" :rows="4" />

        <Button @click="startCreation" variant="primary" :disabled="!prompt.trim()"
          class="w-full py-4 font-bold active:scale-[0.99]">
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
import { TextArea } from '@codebridger/lib-vue-components/form'
import { useVideoStore } from '../stores/videoStore'

const router = useRouter()
const videoStore = useVideoStore()
const fileSelected = ref(false)
const fileName = ref('')
const prompt = ref('')

const selectFile = () => {
  // Mock file selection
  fileName.value = 'presentation_video.mp4'
  fileSelected.value = true
}

const startCreation = () => {
  if (fileSelected.value && prompt.value.trim()) {
    videoStore.clearMessages()
    videoStore.addMessage({
      role: 'user',
      content: prompt.value.trim(),
      files: [{ url: 'presentation_video.mp4', type: 'actual' }]
    })
    router.push('/chat')
  }
}
</script>
