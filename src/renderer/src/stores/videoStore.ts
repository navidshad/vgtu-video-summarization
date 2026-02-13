import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Attachment {
	url: string
	type: 'preview' | 'actual' | 'original'
}

export interface Message {
	id: string
	role: 'user' | 'ai'
	content: string
	isPending: boolean
	files?: Attachment[]
	timeline?: any
	createdAt: number
}

export interface Thread {
	id: string
	title: string
	videoPath: string
	preprocessing: {
		audioPath?: string
		lowResVideoPath?: string;
		transcript?: any;
	}
	messages: Message[]
	createdAt: number
	updatedAt: number
}

export const useVideoStore = defineStore('video', () => {
	const threads = ref<Thread[]>([])
	const currentThreadId = ref<string | null>(null)

	const currentThread = computed(() =>
		threads.value.find(t => t.id === currentThreadId.value) || null
	)

	const messages = computed(() => {
		if (!currentThread.value) return []
		const msgs = [...currentThread.value.messages]

		// Inject the original video into the first message if it's a user message and has no files
		if (msgs.length > 0 && msgs[0].role === 'user' && (!msgs[0].files || msgs[0].files.length === 0) && currentThread.value.videoPath) {
			// Create a shallow copy of the first message to avoid mutating the source of truth directly (though safe here as we cloned array)
			// But we need to be careful not to mutate the object ref if it confuses Vue, ensuring reactivity.
			// Actually best to return a new object for the modified message.
			msgs[0] = {
				...msgs[0],
				files: [{ url: 'file://' + currentThread.value.videoPath, type: 'original' }]
			}
		}

		return msgs
	})

	const currentVideoName = computed(() => currentThread.value?.title || '')
	const currentVideoPath = computed(() => currentThread.value?.videoPath || '')

	const fetchThreads = async () => {
		threads.value = await (window as any).api.getAllThreads()
	}

	const createThread = async (videoPath: string, videoName: string) => {
		const newThread = await (window as any).api.createThread(videoPath, videoName)
		threads.value.unshift(newThread)
		currentThreadId.value = newThread.id
		return newThread.id
	}

	const selectThread = async (id: string) => {
		const thread = await (window as any).api.getThread(id)
		if (thread) {
			const index = threads.value.findIndex(t => t.id === id)
			if (index !== -1) {
				threads.value[index] = thread
			} else {
				threads.value.unshift(thread)
			}
			currentThreadId.value = id
		}
	}

	const addMessage = async (content: string, role: 'user' | 'ai') => {
		if (!currentThreadId.value) return

		const message = {
			role,
			content,
			isPending: role === 'ai'
		}

		const newMessage = await (window as any).api.addMessage(currentThreadId.value, message)

		// Update local state
		if (currentThread.value) {
			currentThread.value.messages.push(newMessage)
		}

		return newMessage.id
	}

	const clearMessages = () => {
		// Not used in thread mode, but kept for compatibility or cleanup
	}

	// Used when pipeline updates status
	const updateMessage = (id: string, partial: Partial<Omit<Message, 'id'>>) => {
		if (!currentThread.value) return

		const index = currentThread.value.messages.findIndex((m) => m.id === id)
		if (index !== -1) {
			currentThread.value.messages[index] = {
				...currentThread.value.messages[index],
				...partial
			}
		}
	}

	const startProcessing = async (threadId: string) => {
		if (!threadId) return

		// Ensure we are working with fresh data
		await selectThread(threadId)

		if (!currentThread.value) return

		// Add initial AI status message
		const id = await addMessage('Initializing pipeline...', 'ai')

		if ((window as any).api) {
			// Setup listener
			const cleanup = (window as any).api.onPipelineUpdate((data: any) => {
				if (data.id === id) {
					if (data.type === 'status') {
						updateMessage(id, { content: data.content })
					} else if (data.type === 'finish') {
						updateMessage(id, {
							content: data.content,
							isPending: false,
							files: data.video ? [{ url: data.video.path, type: data.video.type } as Attachment] : [],
							timeline: data.timeline
						})
						cleanup() // Remove listener when done
					}
				}
			})

			// Find the last user message to use as prompt
			const lastUserMessage = currentThread.value.messages
				.slice()
				.reverse()
				.find((m) => m.role === 'user')
			
			await (window as any).api.startPipeline({
				threadId,
				messageId: id,
				videoPath: currentThread.value.videoPath,
				userPrompt: lastUserMessage?.content,
				duration: 90
			})
		}
	}

	const deleteThread = async (id: string) => {
		const success = await (window as any).api.deleteThread(id)
		if (success) {
			threads.value = threads.value.filter(t => t.id !== id)
			if (currentThreadId.value === id) {
				currentThreadId.value = null
			}
		}
		return success
	}

	const deleteAllThreads = async () => {
		const success = await (window as any).api.deleteAllThreads()
		if (success) {
			threads.value = []
			currentThreadId.value = null
		}
		return success
	}

	return {
		threads,
		currentThreadId,
		currentThread,
		messages,
		currentVideoName,

		fetchThreads,
		createThread,
		selectThread,
		addMessage,
		clearMessages,
		startProcessing,
		deleteThread,
		deleteAllThreads,
		updateMessage
	}
})
