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
							<div class="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-pre:text-zinc-100"
								v-html="renderedContent"></div>
							<div v-if="!message.isPending && (message.role === MessageRole.AI || (message.role === MessageRole.User && (hasOriginalVideo || referencedVersion)))"
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

								<span
									v-if="referencedVersion || showVersionTag || (message.role === MessageRole.User && hasOriginalVideo)"
									class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-2">
									<div v-if="referencedVersion"
										class="flex items-center gap-1 dark:border-zinc-700 pr-2 cursor-pointer hover:underline"
										@click="$emit('scroll-to-reference', message.editRefId)">
										<span class="text-zinc-500 font-medium text-[8px]">EDITING</span>
										<span class="text-blue-500 font-bold">v.{{ referencedVersion }}</span>
									</div>
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
									:role="message.role" :is-pending="message.isPending"
									@save="$emit('save-video', $event)" @edit="$emit('edit', message.id)" />

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
import { useVideoStore } from '../../stores/videoStore'
import markdownit from 'markdown-it'

const props = defineProps<{
	message: Message
}>()

defineEmits(['edit', 'save-video', 'scroll-to-reference'])

const videoStore = useVideoStore()
const isTimelineExpanded = ref(false)

const referencedVersion = computed(() => {
	if (!props.message.editRefId) return null
	const refMsg = videoStore.messages.find(m => m.id === props.message.editRefId)
	if (!refMsg) return null
	return refMsg.version || refMsg.id.slice(0, 4)
})

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

const md = new markdownit({
	html: false,
	linkify: true,
	typographer: true
})

const renderedContent = computed(() => {
	return md.render(props.message.content)
})

const toggleTimeline = () => {
	isTimelineExpanded.value = !isTimelineExpanded.value
}
</script>
