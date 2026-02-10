<template>
  <div class="flex items-center justify-center h-full bg-transparent p-4">
    <div class="w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-2xl">
      <h1 class="text-2xl font-bold text-center mb-6 text-white">Gemini API Key</h1>
      <p class="text-zinc-400 text-center mb-8">Please provide your Gemini API key to get started.</p>

      <div class="space-y-4">
        <Input v-model="apiKey" type="password" placeholder="Enter API Key..." class="font-mono text-sm" />

        <Button @click="saveKey" :disabled="!apiKey" variant="primary" class="w-full font-semibold">
          Continue
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@codebridger/lib-vue-components/form'
import { Button } from '@codebridger/lib-vue-components/elements'

const apiKey = ref('')
const router = useRouter()

const saveKey = () => {
  if (apiKey.value) {
    localStorage.setItem('gemini_api_key', apiKey.value)
    router.push('/upload')
  }
}
</script>
