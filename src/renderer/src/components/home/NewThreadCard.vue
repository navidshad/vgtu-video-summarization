<template>
	<div @click="$emit('click')"
		class="group cursor-pointer min-h-[220px] rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 flex flex-col items-center justify-center text-center p-6">
		<div
			class="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-blue-500">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none"
				stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		</div>
		<h3
			class="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
			Create New Edit</h3>
		<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Start a new video analysis</p>
	</div>
</template>

<script setup lang="ts">
defineEmits(['click'])
</script>
