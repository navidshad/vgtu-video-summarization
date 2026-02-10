<template>
  <div class="flex items-center justify-center h-full bg-zinc-950 p-4">
    <div class="w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-2xl">
      <h1 class="text-2xl font-bold text-center mb-6">Gemini API Key</h1>
      <p class="text-zinc-400 text-center mb-8">Please provide your Gemini API key to get started.</p>
      
      <div class="space-y-4">
        <input 
          v-model="apiKey"
          type="password"
          placeholder="Enter API Key..."
          class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
        />
        
        <button 
          @click="saveKey"
          :disabled="!apiKey"
          class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg px-4 py-3 font-semibold transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const apiKey = ref('')
const router = useRouter()

const saveKey = () => {
  if (apiKey.value) {
    localStorage.setItem('gemini_api_key', apiKey.value)
    router.push('/upload')
  }
}
</script>
