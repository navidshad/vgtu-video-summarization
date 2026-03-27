<template>
	<header
		class="py-4 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md z-10">
		<div class="flex items-center space-x-4">
			<IconButton @click="$emit('back')" icon="IconArrowLeft" size="sm" />
			<div class="flex items-center space-x-2">
				<Teleport to="#header-actions-portal">
					<Tooltip text="Open Artifacts Folder" placement="bottom" color="white">
						<IconButton @click="handleOpenFolder" icon="IconFolder" size="sm" />
					</Tooltip>
				</Teleport>
			<div>
			    <h2 class="text-xs font-bold tracking-tight text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
					{{ title || 'AI Video Assistant' }}
					<Tooltip v-if="videoStore.isBackgroundProcessingActive" :text="activeTasksText" placement="bottom" color="white">
						<div class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
							<div class="h-2 w-2 border-[1.5px] border-current border-t-transparent rounded-full animate-spin"></div>
							<span class="text-[8px] font-bold uppercase tracking-wider">Processing File</span>
						</div>
					</Tooltip>
				</h2>
				<p v-if="totalCost > 0" class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
					Total Cost: ${{ totalCost.toFixed(4) }}
				</p>
			</div>	
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { IconButton, Tooltip } from 'pilotui/elements'
import { computed } from 'vue'
import { useVideoStore } from '../../stores/videoStore'

const videoStore = useVideoStore()

defineProps<{
	title?: string
}>()

const totalCost = computed(() => {
	return videoStore.messages.reduce((acc, msg) => acc + (msg.cost || 0), 0)
})

const activeTasksText = computed(() => {
	if (!videoStore.activeBackgroundTasks.length) return ''
	const names = videoStore.activeBackgroundTasks.map(t => t.name)
	return `Background Tasks:\n${names.join('\n')}`
})

const handleOpenFolder = async () => {
	if (videoStore.currentThreadId) {
		// @ts-ignore
		await window.api.openThreadDir(videoStore.currentThreadId)
	}
}

defineEmits(['back'])
</script>
