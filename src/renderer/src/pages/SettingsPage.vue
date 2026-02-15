<template>
	<div
		class="h-full overflow-hidden flex flex-col p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
		<!-- Header -->
		<div class="flex items-center space-x-4">
			<IconButton @click="router.back()" icon="IconArrowLeft" size="xs"/>
			<div>
				<h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">Configure application preferences</p>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto -mx-8 px-8 py-2">
			<div class="max-w-3xl space-y-6 pb-8">
				<!-- Temp Directory section -->
				<div
					class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
					<div class="flex items-center space-x-3 mb-6">
						<div
							class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20 10V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
								<path d="M12 2v10l3-3 3 3V2" />
							</svg>
						</div>
						<div>
							<h3 class="font-bold text-zinc-900 dark:text-white">Temporary Directory</h3>
							<p class="text-xs text-zinc-500 dark:text-zinc-400">Location where intermediate files are
								stored
							</p>
						</div>
					</div>

					<div class="space-y-4">
						<div
							class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-600 dark:text-zinc-400 break-all">
							{{ tempDir || 'Loading...' }}
						</div>

						<div class="flex gap-4 justify-between">
							<Button @click="handleChange" outline color="secondary" size="sm" label="Change Location" class="w-full" />
							<Button @click="handleOpen" size="sm" label="Open Folder" class="w-full" />
							<Button @click="handleReset" size="sm" label="Reset to Default" class="w-full" />
						</div>
					</div>
				</div>

				<!-- Gemini API Key section -->
				<div
					class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
					<div class="flex items-center space-x-3 mb-6">
						<div
							class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 2l-2 2" />
								<circle cx="7" cy="13" r="5" />
								<path d="M11 9l9-9 3 3-3 3-4 4-4-4" />
								<path d="M13 13l4 4" />
							</svg>
						</div>
						<div>
							<h3 class="font-bold text-zinc-900 dark:text-white">Gemini API Key</h3>
							<p class="text-xs text-zinc-500 dark:text-zinc-400">Your secret API key for Gemini services
							</p>
						</div>
					</div>

					<div class="space-y-4">
						<Input v-model="apiKey" type="password" placeholder="Enter API Key..."
							class="font-mono text-sm !bg-zinc-50 dark:!bg-zinc-800/50 !border-zinc-200 dark:!border-zinc-700 !text-zinc-900 dark:!text-white placeholder:text-zinc-400 focus:!border-blue-500 transition-all" />

						<Button @click="handleSaveApiKey" :disabled="!apiKey || apiKey === initialApiKey" size="sm" class="w-full" label="Save API Key" />
					</div>
				</div>
				<!-- Danger Zone -->
				<div
					class="bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 dark:border-red-900/30 p-6 shadow-sm">
					<div class="flex items-center space-x-3 mb-6">
						<div
							class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							</svg>
						</div>
						<div>
							<h3 class="font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
							<p class="text-xs text-red-500/70 dark:text-red-400/70">Irreversible actions</p>
						</div>
					</div>

					<div class="space-y-4">
						<p class="text-sm text-zinc-600 dark:text-zinc-400">
							Permanently delete all chats, video summaries, and cached files. This action cannot be
							undone.
						</p>
						<Button @click="handleDeleteAll" label="Delete All Data" outline color="danger" class="w-full" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button, IconButton } from '@codebridger/lib-vue-components/elements'
import { Input } from '@codebridger/lib-vue-components/form'
import { useVideoStore } from '../stores/videoStore'

const router = useRouter()
const videoStore = useVideoStore()
const tempDir = ref('')
const apiKey = ref('')
const initialApiKey = ref('')

const fetchSettings = async () => {
	tempDir.value = await (window as any).api.getTempDir()
	const key = await (window as any).api.getGeminiApiKey()
	if (key) {
		apiKey.value = key
		initialApiKey.value = key
	}
}

const handleChange = async () => {
	const result = await (window as any).api.setTempDir()
	if (result) {
		tempDir.value = result
	}
}

const handleOpen = () => {
	; (window as any).api.openTempDir()
}

const handleReset = async () => {
	const result = await (window as any).api.resetTempDir()
	if (result) {
		tempDir.value = result
	}
}

const handleSaveApiKey = async () => {
	if (apiKey.value) {
		await (window as any).api.setGeminiApiKey(apiKey.value)
		initialApiKey.value = apiKey.value
	}
}

const handleDeleteAll = async () => {
	if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
		await videoStore.deleteAllThreads()
		alert('All data deleted successfully.')
	}
}

onMounted(() => {
	fetchSettings()
})
</script>
