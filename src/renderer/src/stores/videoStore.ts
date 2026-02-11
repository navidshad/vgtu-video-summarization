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

	return {
		messages,
		addMessage,
		updateMessage,
		clearMessages
	}
})
