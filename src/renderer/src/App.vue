<template>
  <AppRoot layout-style="full">
    <div class="h-screen w-screen overflow-hidden">
      <!-- Theme Toggle (Temporary for testing) -->
      <div class="absolute top-4 right-4 z-50">
        <button @click="toggleTheme"
          class="p-2 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors">
          {{ appStore.theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
      <router-view />
    </div>
  </AppRoot>
</template>

<script setup lang="ts">
import { App as AppRoot } from '@codebridger/lib-vue-components/shell'
import { useAppStore } from '@codebridger/lib-vue-components/store'
import { onMounted } from 'vue'

const appStore = useAppStore()

const toggleTheme = () => {
  appStore.toggleTheme(appStore.theme === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  // Initialize theme from store
  if (!appStore.theme) {
    appStore.toggleTheme('dark')
  }
})
</script>
