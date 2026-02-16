<template>
	<div class="flex-1 min-w-0">
		<button @click="$emit('toggle')"
			class="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group/toggle">
			<span>Video Timeline</span>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform duration-300 transform"
				:class="isExpanded ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>

		<div v-if="isExpanded"
			class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
			<div v-for="(item, idx) in timeline" :key="idx"
				class="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm">
				<span class="font-mono text-blue-500 font-medium whitespace-nowrap text-[11px] leading-tight shrink-0">
					{{ item.start }} <br /> {{ item.end }}
				</span>
				<span class="text-zinc-700 dark:text-zinc-300 leading-snug">{{ item.text }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { TimelineSegment } from '@shared/types'

defineProps<{
	timeline: TimelineSegment[]
	isExpanded: boolean
}>()

defineEmits(['toggle'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #3f3f46;
	border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: #52525b;
}
</style>
