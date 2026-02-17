<template>
  <div class="flex items-center justify-center h-full bg-transparent p-4">
    <div
      class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl dark:shadow-2xl transition-colors">
      <h1 class="text-2xl font-bold text-center mb-6 text-zinc-900 dark:text-white transition-colors">Gemini API Key
      </h1>
      <p class="text-zinc-500 dark:text-zinc-400 text-center mb-8 transition-colors">Please provide your Gemini API key
        to get started.</p>

      <div class="space-y-4">
        <div class="space-y-2">
          <Input v-model="apiKey" type="password" placeholder="Enter API Key..."
            class="font-mono text-sm !bg-zinc-50 dark:!bg-zinc-950 !border-zinc-200 dark:!border-zinc-800 !text-zinc-900 dark:!text-white placeholder:text-zinc-400 focus:!border-blue-500 transition-all" />
          <p class="text-xs text-center text-zinc-400">
            <a href="https://aistudio.google.com/app/apikey" target="_blank"
              class="hover:text-blue-500 underline decoration-dotted underline-offset-2">Get your key here</a>
          </p>
        </div>

        <Button @click="saveKey" :disabled="!apiKey" color="primary" class="w-full" label="Continue" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from 'pilotui/form'
import { Button } from 'pilotui/elements'

const apiKey = ref('')
const router = useRouter()

onMounted(async () => {
  const existingKey = await (window as any).api.getGeminiApiKey()
  if (existingKey) {
    router.push('/upload')
  }
})

const saveKey = async () => {
  if (apiKey.value) {
    await (window as any).api.setGeminiApiKey(apiKey.value)
    router.push('/upload')
  }
}
</script>
