<template>
	<div class="flex flex-col group animate-in slide-in-from-bottom-4 duration-500"
		:class="message.role === MessageRole.User ? 'items-end' : 'items-start'">
		<!-- Role Indicator -->
		<div class="flex items-center space-x-2 mb-2 px-1"
			:class="message.role === MessageRole.User ? 'flex-row-reverse space-x-reverse' : 'flex-row'">
			<span class="text-[10px] font-bold text-zinc-400/80 dark:text-zinc-500 uppercase tracking-[0.2em] font-heading">
				{{ message.role === MessageRole.User ? 'You' : 'AI Assistant' }}
			</span>

			<!-- Action Buttons (Remove/Retry) -->
			<div v-if="!message.isPending && (!isFirst || (isLatestUser && message.role === MessageRole.User))"
				class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75">
				<IconButton v-if="isLatestUser && message.role === MessageRole.User" icon="IconRefresh" size="xs"
					rounded="full" title="Retry from this message" @click="handleRetry" />
				<IconButton v-if="!isFirst" icon="IconTrashLines" size="xs" rounded="full" title="Remove Message"
					@click="handleRemove" />
			</div>
		</div>

		<!-- Message Content Wrapper (Text + Attachments) -->
		<div class="relative group flex flex-col gap-0.5 w-full"
			:class="message.role === MessageRole.User ? 'items-end' : 'items-start'">
			<!-- Text Message Bubble -->
			<Card :class="[
				'!rounded-lg !p-3.5 shadow-sm dark:shadow-xl transition-all w-fit max-w-[85%] md:max-w-[75%]',
				message.role === MessageRole.User
					? '!bg-zinc-200 dark:!bg-zinc-800 !text-zinc-900 dark:!text-zinc-100 !border-0 rounded-tr-lg'
					: '!bg-white dark:!bg-zinc-900/90 !text-zinc-900 dark:!text-zinc-200 border !border-zinc-100 dark:!border-zinc-800 rounded-tl-lg backdrop-blur-sm',
				message.isPending ? 'opacity-90' : ''
			]">
				<div class="flex items-start space-x-4">
					<div v-if="message.isPending" class="mt-1">
						<div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-lg animate-spin"></div>
					</div>
						<div class="space-y-4 w-full">
						<div class="flex flex-col gap-2">
							<div class="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-pre:rounded-lg prose-pre:text-zinc-100 prose-headings:font-heading"
								v-html="renderedContent"></div>
							
							<!-- Meta/Status Row -->
							<div v-if="!message.isPending && (message.role === MessageRole.AI || (message.role === MessageRole.User && (hasOriginalVideo || referencedVersion)))"
								class="flex items-center justify-end gap-2 pt-2 opacity-60 hover:opacity-100 transition-opacity">
								<template v-if="message.role === MessageRole.AI">
									<span v-if="message.usage"
										class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded">
										{{ message.usage.totalTokens.toLocaleString() }} tok
									</span>
									<span v-if="message.cost"
										class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded">
										${{ message.cost.toFixed(4) }}
									</span>
								</template>

								<!-- Edit Reference Tag -->
								<span v-if="referencedVersion"
									class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:underline hover:text-primary transition-colors"
									@click="$emit('scroll-to-reference', message.editRefId)">
									<span class="font-bold text-[8px] uppercase tracking-wider">{{ editLabel }}</span>
									<span class="text-primary font-bold">v.{{ referencedVersion }}</span>
								</span>

								<!-- Current Version/Type Tag -->
								<span v-if="showVersionTag || (message.role === MessageRole.User && hasOriginalVideo)"
									class="text-[9px] text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded flex items-center gap-1">
									<span v-if="showVersionTag" class="opacity-70">v.{{ message.version ||
										message.id.slice(0, 4) }}</span>
									<span v-if="videoType || (message.role === MessageRole.User && hasOriginalVideo)"
										class="text-blue-600 dark:text-blue-400 font-extrabold uppercase text-[8px] tracking-wider">{{
											message.role === MessageRole.User ? 'ORIGINAL' : videoType }}</span>
								</span>
							</div>
						</div>

						<!-- Results Section: Timeline + Video Layout -->
						<div v-if="(message.timeline && message.timeline.length > 0) || (message.files && message.files.length > 0)"
							class="mt-3 pt-3 border-t flex flex-col gap-4"
							:class="message.role === MessageRole.User ? 'border-zinc-200/50' : 'border-zinc-100 dark:border-zinc-800/50'">
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
import { Card, IconButton } from 'pilotui/elements'
import { MessageRole, Message, FileType } from '@shared/types'
import VideoResult from './VideoResult.vue'
import TimelineResult from './TimelineResult.vue'
import { useVideoStore } from '../../stores/videoStore'
import markdownit from 'markdown-it'

const props = defineProps<{
	message: Message,
	isFirst?: boolean,
	isLatestUser?: boolean
}>()

const emit = defineEmits(['edit', 'save-video', 'scroll-to-reference', 'remove', 'retry'])

const videoStore = useVideoStore()
const isTimelineExpanded = ref(false)

const handleRemove = async () => {
	const response = await (window as any).api.showConfirmation({
		title: 'Remove Message',
		message: 'Are you sure you want to remove this message?',
		detail: 'This will permanently remove this message and all its generated videos. This action cannot be undone.',
		type: 'warning',
		buttons: ['Cancel', 'Remove'],
		defaultId: 1,
		cancelId: 0
	})

	if (response === 1) {
		emit('remove', props.message.id)
	}
}

const handleRetry = async () => {
	const response = await (window as any).api.showConfirmation({
		title: 'Retry Generation',
		message: 'Are you sure you want to retry?',
		detail: 'All subsequent AI responses will be removed and the generation will restart from this message.',
		type: 'question',
		buttons: ['Cancel', 'Retry'],
		defaultId: 1,
		cancelId: 0
	})

	if (response === 1) {
		emit('retry', props.message.id)
	}
}

const referencedVersion = computed(() => {
	if (!props.message.editRefId) return null
	const thread = videoStore.currentThread
	if (!thread) return null

	// Find version number by counting users messages in the thread up to the ref message
	const messages = thread.messages
	let version = 1
	for (const msg of messages) {
		if (msg.id === props.message.editRefId) break
		if (msg.role === MessageRole.User) version++
	}

	return version
})

const toggleTimeline = () => {
	isTimelineExpanded.value = !isTimelineExpanded.value
}


const showVersionTag = computed(() => {
	return props.message.role === MessageRole.AI && props.message.files && props.message.files.some(f => f.type === FileType.Preview || f.type === FileType.Actual)
})

const editLabel = computed(() => {
	if (props.message.role === MessageRole.User) return 'EDITING'
	if (showVersionTag.value) return 'EDITED'
	return 'EDITING'
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
</script>
