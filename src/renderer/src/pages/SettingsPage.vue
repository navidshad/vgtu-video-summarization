<template>
	<div class="h-full flex flex-col p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
		<!-- Header -->
		<div class="flex items-center space-x-4">
			<button @click="router.back()"
				class="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400 active:scale-95 shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
			<div>
				<h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">Configure application preferences</p>
			</div>
		</div>

		<div class="max-w-3xl space-y-6">
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
						<p class="text-xs text-zinc-500 dark:text-zinc-400">Location where intermediate files are stored
						</p>
					</div>
				</div>

				<div class="space-y-4">
					<div
						class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-600 dark:text-zinc-400 break-all">
						{{ tempDir || 'Loading...' }}
					</div>

					<div class="flex space-x-3">
						<Button @click="handleChange" variant="secondary" size="sm" class="flex-1">
							Change Location
						</Button>
						<Button @click="handleOpen" variant="ghost" size="sm"
							class="flex-1 border border-zinc-200 dark:border-zinc-800">
							Open in Finder
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@codebridger/lib-vue-components/elements'

const router = useRouter()
const tempDir = ref('')

const fetchTempDir = async () => {
	tempDir.value = await (window as any).api.getTempDir()
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

onMounted(() => {
	fetchTempDir()
})
</script>
