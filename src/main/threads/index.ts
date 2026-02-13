import { app, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Define the Thread interface (matching what will be used in frontend)
export interface Message {
	id: string
	role: 'user' | 'ai'
	content: string
	isPending: boolean
	files?: { url: string; type: 'preview' | 'actual' }[]
	createdAt: number
}

export interface Thread {
	id: string
	title: string
	videoPath: string
	preprocessing: {
		audioPath?: string
		lowResVideoPath?: string;
		transcript?: any; // Structured transcript
	}
	messages: Message[]
	createdAt: number
	updatedAt: number
}

class ThreadManager {
	private threadsDir: string

	constructor() {
		this.threadsDir = path.join(app.getPath('userData'), 'threads')
		this.ensureThreadsDir()
	}

	private ensureThreadsDir() {
		if (!fs.existsSync(this.threadsDir)) {
			fs.mkdirSync(this.threadsDir, { recursive: true })
		}
	}

	private getThreadPath(threadId: string) {
		return path.join(this.threadsDir, `${threadId}.json`)
	}

	// Create a new thread
	createThread(videoPath: string, videoName: string): Thread {
		const id = uuidv4()
		const thread: Thread = {
			id,
			title: videoName,
			videoPath,
			preprocessing: {},
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now()
		}

		fs.writeFileSync(this.getThreadPath(id), JSON.stringify(thread, null, 2))
		return thread
	}

	// Get all threads (for the list view)
	getAllThreads(): Thread[] {
		this.ensureThreadsDir()
		const files = fs.readdirSync(this.threadsDir).filter(file => file.endsWith('.json'))
		const threads: Thread[] = []

		for (const file of files) {
			try {
				const content = fs.readFileSync(path.join(this.threadsDir, file), 'utf-8')
				const thread = JSON.parse(content)
				threads.push(thread)
			} catch (error) {
				console.error(`Failed to parse thread file ${file}:`, error)
			}
		}

		// Sort by recently updated
		return threads.sort((a, b) => b.updatedAt - a.updatedAt)
	}

	// Get a specific thread
	getThread(id: string): Thread | null {
		const filePath = this.getThreadPath(id)
		if (!fs.existsSync(filePath)) {
			return null
		}

		try {
			const content = fs.readFileSync(filePath, 'utf-8')
			return JSON.parse(content)
		} catch (error) {
			console.error(`Failed to read thread ${id}:`, error)
			return null
		}
	}

	// Update a thread
	updateThread(id: string, updates: Partial<Thread>): Thread | null {
		const thread = this.getThread(id)
		if (!thread) return null

		const updatedThread = {
			...thread,
			...updates,
			updatedAt: Date.now()
		}

		fs.writeFileSync(this.getThreadPath(id), JSON.stringify(updatedThread, null, 2))
		return updatedThread
	}

	// Delete a thread and its file
	deleteThread(id: string): boolean {
		const filePath = this.getThreadPath(id)
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
			// TODO: Optionally delete associated artifacts if they are stored in a thread-specific folder
			return true
		}
		return false
	}

	// NEW: Delete all threads
	deleteAllThreads(): boolean {
		try {
			this.ensureThreadsDir()
			const files = fs.readdirSync(this.threadsDir)
			for (const file of files) {
				fs.unlinkSync(path.join(this.threadsDir, file))
			}
            // Also clean up temp directory if needed, but for now just threads
			return true
		} catch (error) {
			console.error('Failed to delete all threads:', error)
			return false
		}
	}

    // Helper to add a message to a thread
    addMessageToThread(threadId: string, message: Omit<Message, 'id' | 'createdAt'>): Message | null {
        const thread = this.getThread(threadId)
        if (!thread) return null

        const fullMessage: Message = {
            id: uuidv4(),
            createdAt: Date.now(),
            ...message
        }

        thread.messages.push(fullMessage)
        thread.updatedAt = Date.now()
        
        fs.writeFileSync(this.getThreadPath(threadId), JSON.stringify(thread, null, 2))
        return fullMessage
    }

    // Update specific message in a thread
    updateMessageInThread(threadId: string, messageId: string, updates: Partial<Message>): boolean {
        const thread = this.getThread(threadId)
        if (!thread) return false

        const msgIndex = thread.messages.findIndex(m => m.id === messageId)
        if (msgIndex === -1) return false

        thread.messages[msgIndex] = { ...thread.messages[msgIndex], ...updates }
        thread.updatedAt = Date.now()

        fs.writeFileSync(this.getThreadPath(threadId), JSON.stringify(thread, null, 2))
        return true
    }
}

export const threadManager = new ThreadManager()
