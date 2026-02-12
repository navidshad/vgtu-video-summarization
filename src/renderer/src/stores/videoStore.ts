import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Attachment {
	url: string
	type: 'preview' | 'actual'
}

export interface Message {
	id: string
	role: 'user' | 'ai'
	content: string
	isPending: boolean
	files?: Attachment[]
}

export const useVideoStore = defineStore('video', () => {
	const messages = ref<Message[]>([])
	const currentVideoName = ref('')
	const currentVideoPath = ref('')

	const addMessage = (message: Omit<Message, 'id' | 'isPending'> & { isPending?: boolean }) => {
		const id = Math.random().toString(36).substring(2, 9)
		const newMessage: Message = {
			...message,
			id,
			isPending: message.isPending ?? false
		}
		messages.value.push(newMessage)
		return id
	}

	const updateMessage = (id: string, partial: Partial<Omit<Message, 'id'>>) => {
		const index = messages.value.findIndex((m) => m.id === id)
		if (index !== -1) {
			messages.value[index] = { ...messages.value[index], ...partial }
		}
	}

	const clearMessages = () => {
		messages.value = []
	}

	const startProcessing = async (videoPath?: string) => {
		const path = videoPath || currentVideoPath.value
		if (!path) {
			console.error('No video path available for processing')
			return
		}

		const id = addMessage({
			role: 'ai',
			content: 'Initializing pipeline...',
			isPending: true
		})

		if ((window as any).api) {
			; (window as any).api.onPipelineUpdate((data: any) => {
				if (data.id === id) {
					if (data.type === 'status') {
						updateMessage(id, { content: data.content })
					} else if (data.type === 'finish') {
						updateMessage(id, {
							content: data.content,
							isPending: false,
							files: data.videoFile ? [{ url: data.videoFile, type: 'actual' } as Attachment] : []
						})
					}
				}
			})

			await (window as any).api.startPipeline({ messageId: id, videoPath: path })
		}
	}


	const setVideoName = (name: string) => {
		currentVideoName.value = name
	}

	const setVideoPath = (path: string) => {
		currentVideoPath.value = path
	}

	return {
		messages,
		currentVideoName,
		currentVideoPath,
		addMessage,
		updateMessage,
		clearMessages,
		startProcessing,
		setVideoName,
		setVideoPath
	}
})
