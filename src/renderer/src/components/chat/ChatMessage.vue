<template>
	<div class="flex flex-col animate-in slide-in-from-bottom-4 duration-500"
		:class="message.role === MessageRole.User ? 'items-end' : 'items-start'">
		<!-- Role Indicator -->
		<div class="flex items-center space-x-2 mb-2 px-1"
			:class="message.role === MessageRole.User ? 'flex-row-reverse space-x-reverse' : 'flex-row'">
			<span class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
				{{ message.role === MessageRole.User ? 'You' : 'AI Assistant' }}
			</span>
		</div>

		<!-- Message Content Wrapper (Text + Attachments) -->
		<div class="relative group flex flex-col gap-2 w-full"
			:class="message.role === MessageRole.User ? 'items-end' : 'items-start'">
			<!-- Edit Button for AI Messages -->
			<button v-if="message.role === MessageRole.AI && !message.isPending" @click="$emit('edit', message.id)"
				class="absolute left-full top-0 ml-4 flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10"
				title="Branch from this result">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20.2 6 3 11l-.9-2.4c-.5-1.1.2-2.4 1.3-2.9l13.2-4.8c1.1-.5 2.4.2 2.9 1.3l.7 1.8z" />
					<path d="m6.2 5.3 3.1 3.9" />
					<path d="m12.4 3.4 3.1 4" />
					<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
				</svg>
				<span>Edit this version</span>
			</button>

			<!-- Text Message Bubble -->
			<Card :class="[
				'!rounded-2xl !p-4 shadow-sm dark:shadow-xl transition-colors w-fit max-w-[450px]',
				message.role === MessageRole.User
					? '!bg-zinc-100 dark:!bg-zinc-100 !text-zinc-900 !border-0'
					: '!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-zinc-200 border !border-zinc-200 dark:!border-zinc-800',
				message.isPending ? 'opacity-80' : ''
			]">
				<div class="flex items-start space-x-3">
					<div v-if="message.isPending" class="mt-1">
						<svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
							viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
							</circle>
							<path class="opacity-75" fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
							</path>
						</svg>
					</div>
					<div class="space-y-4 w-full">
						<div class="flex flex-col gap-1">
							<p class="text-[14px] leading-relaxed">{{ message.content }}</p>
							<div v-if="!message.isPending && (message.role === MessageRole.AI || (message.role === MessageRole.User && hasOriginalVideo))"
								class="flex items-center justify-end gap-2">
								<template v-if="message.role === MessageRole.AI">
									<span v-if="message.usage"
										class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
										{{ message.usage.totalTokens.toLocaleString() }} tokens
									</span>
									<span v-if="message.cost"
										class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
										${{ message.cost.toFixed(4) }}
									</span>
								</template>

								<span v-if="showVersionTag || (message.role === MessageRole.User && hasOriginalVideo)"
									class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
									<span v-if="showVersionTag" class="opacity-70">v.{{ message.version ||
										message.id.slice(0, 4) }}</span>
									<span v-if="videoType || (message.role === MessageRole.User && hasOriginalVideo)"
										class="text-blue-600 dark:text-blue-400 font-extrabold uppercase text-[8px]">{{
											message.role === MessageRole.User ? 'ORIGINAL' : videoType }}</span>
								</span>
							</div>
						</div>

						<!-- Results Section: Timeline + Video Layout -->
						<div v-if="(message.timeline && message.timeline.length > 0) || (message.files && message.files.length > 0)"
							class="mt-4 pt-4 border-t flex flex-col gap-6"
							:class="message.role === MessageRole.User ? 'border-zinc-200' : 'border-zinc-100 dark:border-zinc-800'">
							<!-- Video Section -->
							<div v-if="message.files && message.files.length > 0" class="flex-1 space-y-3 min-w-0">
								<VideoResult v-for="file in message.files" :key="file.url" :file="file"
									:role="message.role" @save="$emit('save-video', $event)" />
							</div>

							<!-- Timeline Section -->
							<TimelineResult v-if="message.timeline && message.timeline.length > 0"
								:timeline="message.timeline" :is-expanded="isTimelineExpanded"
								@toggle="toggleTimeline" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card } from '@codebridger/lib-vue-components/elements'
import { MessageRole, Message, FileType } from '@shared/types'
import VideoResult from './VideoResult.vue'
import TimelineResult from './TimelineResult.vue'

const props = defineProps<{
	message: Message
}>()

defineEmits(['edit', 'save-video'])

const isTimelineExpanded = ref(false)

const showVersionTag = computed(() => {
	return props.message.role === MessageRole.AI && props.message.files && props.message.files.some(f => f.type === FileType.Preview || f.type === FileType.Actual)
})

const videoType = computed(() => {
	const videoFile = props.message.files?.find(f => f.type === FileType.Preview || f.type === FileType.Actual)
	return videoFile?.type
})

const hasOriginalVideo = computed(() => {
	return props.message.files?.some(f => f.type === FileType.Original)
})

const toggleTimeline = () => {
	isTimelineExpanded.value = !isTimelineExpanded.value
}
</script>
