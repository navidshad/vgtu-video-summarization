<template>
  <AppRoot layout-style="full">
    <div
      class="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-700 relative selection:bg-primary/20">
      
      <!-- Ambient Backgrounds -->
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>

      <!-- Theme Toggle (Temporary for testing) -->
      <div class="absolute top-4 right-4 z-50 flex space-x-2">
        <IconButton @click="router.push('/settings')" icon="IconSettings" size="sm"/>
        <IconButton @click="toggleTheme" :icon="appStore.theme === 'light' ? 'IconMoon' : 'IconSun'" size="sm"/>
      </div>
      
      <!-- Main Content -->
      <div class="relative z-10 h-full w-full">
        <router-view />
      </div>
    </div>
  </AppRoot>
</template>

<script setup lang="ts">
import { App as AppRoot } from '@codebridger/lib-vue-components/shell'
import { useAppStore } from '@codebridger/lib-vue-components/store'
import { IconButton } from '@codebridger/lib-vue-components/elements'
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
