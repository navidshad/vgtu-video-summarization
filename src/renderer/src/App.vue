<template>
  <AppRoot layout-style="full">
    <div
      class="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <!-- Theme Toggle (Temporary for testing) -->
      <div class="absolute top-4 right-4 z-50 flex space-x-2">
        <button @click="router.push('/settings')"
          class="p-2 rounded-full border transition-colors shadow-sm bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button @click="toggleTheme" class="p-2 rounded-full border transition-colors shadow-sm" :class="[
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
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

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
