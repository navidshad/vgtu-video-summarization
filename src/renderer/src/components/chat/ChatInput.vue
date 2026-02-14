<template>
	<footer
		class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20">
		<div class="max-w-4xl mx-auto flex flex-col space-y-2">
			<!-- Replying To Indicator -->
			<div v-if="editingMessageId"
				class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 text-sm">
				<div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
					</svg>
					<span class="font-medium">Branching from previous result</span>
				</div>
				<button @click="$emit('cancel-edit')"
					class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div class="flex items-end space-x-4">
				<!-- Main Input area using Textarea -->
				<div class="flex-1 relative group">
					<TextArea v-model="userPrompt" placeholder="Ask a follow-up question..." :rows="2"
						class="!bg-white dark:!bg-zinc-900 border !border-zinc-200 dark:!border-zinc-800 !rounded-3xl shadow-lg dark:shadow-2xl !p-4 focus-within:!border-blue-500/50 transition-all text-sm resize-none pr-16 custom-scrollbar !text-zinc-900 dark:!text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
						@keydown.enter.prevent="handleSend" />

					<!-- Send Button (Circular) -->
					<div class="absolute right-4 bottom-4">
						<Button variant="primary" @click="handleSend"
							class="!rounded-full w-12 h-12 !p-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
							<svg xmlns="http://www.w3.org/2000/svg"
								class="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="m5 12 7-7 7 7" />
								<path d="M12 19V5" />
							</svg>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@codebridger/lib-vue-components/elements'
import { TextArea } from '@codebridger/lib-vue-components/form'

defineProps<{
	editingMessageId: string | null
}>()

const emit = defineEmits(['send', 'cancel-edit'])
const userPrompt = ref('')

const handleSend = () => {
	if (!userPrompt.value.trim()) return
	emit('send', userPrompt.value)
	userPrompt.value = ''
}
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

:deep(.form-textarea) {
	border-radius: 1.5rem !important;
	border-color: #e4e4e7 !important;
}

:global(.dark) :deep(.form-textarea) {
	border-color: #27272a !important;
}

:deep(.form-textarea:focus) {
	border-color: rgba(59, 130, 246, 0.5) !important;
}
</style>
