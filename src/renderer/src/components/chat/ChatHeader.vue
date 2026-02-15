<template>
	<header
		class="py-4 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md z-10">
		<div class="flex items-center space-x-4">
      <IconButton @click="$emit('back')" icon="IconArrowLeft" size="xs"/>
			<div
				class="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm dark:shadow-none">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400"
					viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
			</div>
			<div>
				<h2 class="text-xs font-bold tracking-tight text-zinc-900 dark:text-white uppercase tracking-widest">
					{{ title || 'AI Video Assistant' }}
				</h2>
				<p v-if="totalCost > 0" class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
					Total Cost: ${{ totalCost.toFixed(4) }}
				</p>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { IconButton } from '@codebridger/lib-vue-components/elements'
import { computed } from 'vue'
import { useVideoStore } from '../../stores/videoStore'

const videoStore = useVideoStore()

defineProps<{
	title?: string
}>()

const totalCost = computed(() => {
	return videoStore.messages.reduce((acc, msg) => acc + (msg.cost || 0), 0)
})

defineEmits(['back'])
</script>
