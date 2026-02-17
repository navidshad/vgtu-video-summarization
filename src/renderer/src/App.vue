<template>
  <AppRoot layout-style="full">
    <div
      class="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <!-- Theme Toggle (Temporary for testing) -->
      <div class="absolute top-4 right-4 z-50 flex space-x-2">
        <IconButton @click="router.push('/settings')" icon="IconSettings" size="sm"/>
        <IconButton @click="toggleTheme" :icon="appStore.theme === 'light' ? 'IconMoon' : 'IconSun'" size="sm"/>
      </div>
      <router-view />
    </div>
  </AppRoot>
</template>

<script setup lang="ts">
import { App as AppRoot } from 'pilotui/shell'
import { useAppStore } from 'pilotui/store'
import { IconButton } from 'pilotui/elements'
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
