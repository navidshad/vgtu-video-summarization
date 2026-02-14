<template>
	<header
		class="py-4 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md z-10">
		<div class="flex items-center space-x-4">
			<button @click="$emit('back')"
				class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
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
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
defineProps<{
	title?: string
}>()

defineEmits(['back'])
</script>
