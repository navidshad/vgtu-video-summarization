import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { MessageRole, FileType } from '@shared/types'
import type { Message, Thread, Usage, UsageRecord } from '@shared/types'
import { settingsManager } from '../settings'

// Re-export needed types for consumers (if any, though shared is better)
export { MessageRole, FileType }
export type { Message }


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
			tempDir: settingsManager.getThreadTempDir(id),
			messages: [],
			versionCounter: 0,
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

	private deleteFile(filePath: string) {
		if (!filePath) return
		const cleanPath = filePath.replace('file://', '')
		if (fs.existsSync(cleanPath)) {
			try {
				fs.unlinkSync(cleanPath)
			} catch (error) {
				console.error(`Failed to delete file ${cleanPath}:`, error)
			}
		}
	}

	private deleteThreadArtifacts(thread: Thread) {
		// Delete preprocessing files
		if (thread.preprocessing) {
			this.deleteFile(thread.preprocessing.audioPath || '')
			this.deleteFile(thread.preprocessing.lowResVideoPath || '')
			this.deleteFile(thread.preprocessing.transcriptPath || '')
		}

		// Delete thread temp directory
		if (thread.tempDir && fs.existsSync(thread.tempDir)) {
			try {
				fs.rmSync(thread.tempDir, { recursive: true, force: true })
			} catch (error) {
				console.error(`Failed to delete thread temp dir ${thread.tempDir}:`, error)
			}
		}

		// Delete message files (excluding original)
		for (const msg of thread.messages) {
			if (msg.files) {
				for (const file of msg.files) {
					if (file.type !== FileType.Original) {
						this.deleteFile(file.url)
					}
				}
			}
		}
	}

	// Delete a thread and its file
	deleteThread(id: string): boolean {
		const thread = this.getThread(id)
		if (thread) {
			this.deleteThreadArtifacts(thread)
		}

		const filePath = this.getThreadPath(id)
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
			return true
		}
		return false
	}

	// NEW: Delete all threads
	deleteAllThreads(): boolean {
		try {
			const threads = this.getAllThreads()
			for (const thread of threads) {
				this.deleteThreadArtifacts(thread)
			}

			this.ensureThreadsDir()
			const files = fs.readdirSync(this.threadsDir)
			for (const file of files) {
				fs.unlinkSync(path.join(this.threadsDir, file))
			}
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

	getNextVersion(threadId: string): number {
		const thread = this.getThread(threadId)
		if (!thread) return 0

		const nextVersion = (thread.versionCounter || 0) + 1
		this.updateThread(threadId, { versionCounter: nextVersion })
		return nextVersion
	}

	// Update usage and cost for a message
	updateMessageUsage(threadId: string, messageId: string, record: UsageRecord): boolean {
		const thread = this.getThread(threadId)
		if (!thread) return false

		const msgIndex = thread.messages.findIndex(m => m.id === messageId)
		if (msgIndex === -1) return false

		const currentMsg = thread.messages[msgIndex]
		const newUsage: Usage = {
			promptTokens: (currentMsg.usage?.promptTokens || 0) + record.usage.promptTokens,
			candidatesTokens: (currentMsg.usage?.candidatesTokens || 0) + record.usage.candidatesTokens,
			thinkingTokens: (currentMsg.usage?.thinkingTokens || 0) + (record.usage.thinkingTokens || 0),
			totalTokens: (currentMsg.usage?.totalTokens || 0) + record.usage.totalTokens
		}

		const newCost = (currentMsg.cost || 0) + record.cost

		thread.messages[msgIndex] = {
			...currentMsg,
			usage: newUsage,
			cost: newCost
		}

		thread.updatedAt = Date.now()
		fs.writeFileSync(this.getThreadPath(threadId), JSON.stringify(thread, null, 2))
		return true
	}
	// Reset all pending messages to non-pending (e.g. on app startup or shutdown)
	resetPendingMessages(): void {
		const threads = this.getAllThreads()
		for (const thread of threads) {
			let hasChanges = false
			for (const msg of thread.messages) {
				if (msg.isPending) {
					msg.isPending = false
					msg.content += ' (Interrupted)'
					hasChanges = true
				}
			}

			if (hasChanges) {
				thread.updatedAt = Date.now()
				fs.writeFileSync(this.getThreadPath(thread.id), JSON.stringify(thread, null, 2))
			}
		}
	}
	// Get formatted context for AI (messages + timelines)
	getThreadContext(threadId: string): string {
		const thread = this.getThread(threadId)
		if (!thread) return ''

		return thread.messages.map(m => {
			let content = `${m.role.toUpperCase()}: ${m.content}`
			if (m.timeline && m.timeline.length > 0) {
				const timelineText = m.timeline.map(t => `[${t.start} - ${t.end}] ${t.text}`).join('\n')
				content += `\n(AI Generated Timeline):\n${timelineText}`
			}
			return content
		}).join('\n\n')
	}
}

export const threadManager = new ThreadManager()
