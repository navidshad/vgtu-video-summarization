<template>
  <AppRoot layout-style="full">
    <div class="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <!-- Theme Toggle (Temporary for testing) -->
      <div class="absolute top-4 right-4 z-50">
        <button @click="toggleTheme"
          class="p-2 rounded-full border transition-colors shadow-sm"
          :class="[
            appStore.theme === 'light' 
              ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-600' 
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400'
          ]">
          {{ appStore.theme === 'light' ? '☀️' : '🌙' }}
        </button>
      </div>
      <router-view />
    </div>
  </AppRoot>
</template>

<script setup lang="ts">
import { App as AppRoot } from '@codebridger/lib-vue-components/shell'
import { useAppStore } from '@codebridger/lib-vue-components/store'
import { onMounted, watch } from 'vue'

const appStore = useAppStore()

const toggleTheme = () => {
  appStore.toggleTheme(appStore.theme === 'light' ? 'dark' : 'light')
}

watch(
  () => appStore.theme,
  (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Initialize theme from store
  if (!appStore.theme) {
    appStore.toggleTheme('dark')
  }
})
</script>
