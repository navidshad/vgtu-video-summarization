import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { MessageRole, FileType } from '@shared/types'
import type { Message, Thread, Usage, UsageRecord, VideoMetadata } from '@shared/types'
import { settingsManager } from '../settings'
import { getVideoMetadata } from '../ffmpeg'

// Re-export needed types for consumers (if any, though shared is better)
export { MessageRole, FileType }
export type { Message }


class ThreadManager {
	private threadsDir: string
	private updateQueues: Map<string, Promise<any>> = new Map()

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

	private saveThread(thread: Thread) {
		const threadPath = this.getThreadPath(thread.id)
		const jsonData = JSON.stringify(thread, null, 2)

		// Save to primary storage (userData)
		fs.writeFileSync(threadPath, jsonData)

		// Mirror to artifact folder (tempDir) if it exists
		if (thread.tempDir && fs.existsSync(thread.tempDir)) {
			const mirrorPath = path.join(thread.tempDir, 'thread.json')
			fs.writeFileSync(mirrorPath, jsonData)
		}
	}

	// Create a new thread
	async createThread(videoPath: string, videoName: string): Promise<Thread> {
		const id = uuidv4()
		const tempDir = settingsManager.getThreadTempDir(id)
		
		// If the video is in a temporary download folder, move it to the thread's artifact folder
		let finalVideoPath = videoPath
		const systemTempDir = settingsManager.getTempDir()
		
		// Strict check: No directories allowed as video source
		if (fs.existsSync(videoPath) && fs.statSync(videoPath).isDirectory()) {
			throw new Error(`Invalid video source: "${videoPath}" is a directory. Please provide a valid video file.`)
		}

		if (videoPath.startsWith(systemTempDir)) {
			try {
				const videoDir = path.join(tempDir, 'video')
				if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true })
				
				// Sanitize the name for the filesystem
				const sanitizedName = videoName.replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_').trim()
				const targetPath = path.join(videoDir, sanitizedName)
				
				fs.renameSync(videoPath, targetPath)
				finalVideoPath = targetPath
				
				// Cleanup empty source download folder
				const sourceDir = path.dirname(videoPath)
				if (sourceDir !== systemTempDir && fs.existsSync(sourceDir) && fs.readdirSync(sourceDir).length === 0) {
					fs.rmdirSync(sourceDir)
				}
			} catch (error) {
				console.error(`Failed to move video to thread directory:`, error)
				// Fallback to original path if move fails
			}
		}


		let videoMetadata: VideoMetadata | undefined
		try {
			videoMetadata = await getVideoMetadata(finalVideoPath)
		} catch (error) {
			console.error(`Failed to extract metadata for ${finalVideoPath}:`, error)
		}

		const thread: Thread = {
			id,
			title: videoName,
			videoPath: finalVideoPath,
			preprocessing: {},
			tempDir,
			messages: [],
			versionCounter: 0,
			videoMetadata,
			createdAt: Date.now(),
			updatedAt: Date.now()
		}

		this.saveThread(thread)
		return thread
	}


	// Get all threads (for the list view)
	getAllThreads(): Thread[] {
		this.ensureThreadsDir()
		const files = fs.readdirSync(this.threadsDir).filter(file => file.endsWith('.json'))
		const threads: Thread[] = []

		for (const file of files) {
			const filePath = path.join(this.threadsDir, file)
			try {
				const content = fs.readFileSync(filePath, 'utf-8')
				const thread = JSON.parse(content) as Thread
				
				// Cleanup: if tempDir is gone, the project artifacts are gone.
				// We remove it from the list.
				if (thread.tempDir && !fs.existsSync(thread.tempDir)) {
					console.warn(`Thread ${thread.id} artifact directory is missing. Cleaning up metadata...`)
					fs.unlinkSync(filePath)
					continue
				}

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

	// Update a thread atomically
	updateThread(id: string, updates: Partial<Thread>): Promise<Thread | null> {
		const existingQueue = this.updateQueues.get(id) || Promise.resolve()

		const nextUpdate = existingQueue.then(async () => {
			const thread = this.getThread(id)
			if (!thread) return null

			const updatedThread = {
				...thread,
				...updates,
				updatedAt: Date.now()
			}

			this.saveThread(updatedThread)
			return updatedThread
		}).catch(err => {
			console.error(`Atomic update failed for thread ${id}:`, err)
			return null
		})

		this.updateQueues.set(id, nextUpdate)

		// Optional: clean up map if queue is idle (not strictly necessary for small number of threads)
		nextUpdate.finally(() => {
			if (this.updateQueues.get(id) === nextUpdate) {
				// Don't delete if another update was already queued
			}
		})

		return nextUpdate
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
	async addMessageToThread(threadId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> {
		const id = uuidv4()
		const createdAt = Date.now()
		const fullMessage: Message = {
			id,
			createdAt,
			...message
		}

		await this.updateThread(threadId, {
			messages: [...(this.getThread(threadId)?.messages || []), fullMessage]
		})

		return fullMessage
	}

	// Update specific message in a thread
	async updateMessageInThread(threadId: string, messageId: string, updates: Partial<Message>): Promise<boolean> {
		const result = await this.updateThread(threadId, {
			messages: (this.getThread(threadId)?.messages || []).map(m =>
				m.id === messageId ? { ...m, ...updates } : m
			)
		})
		return !!result
	}

	getNextVersion(threadId: string): number {
		const thread = this.getThread(threadId)
		if (!thread) return 0

		const nextVersion = (thread.versionCounter || 0) + 1
		this.updateThread(threadId, { versionCounter: nextVersion })
		return nextVersion
	}

	// Update usage and cost for a message
	async updateMessageUsage(threadId: string, messageId: string, record: UsageRecord): Promise<boolean> {
		const result = await this.updateThread(threadId, {
			messages: (this.getThread(threadId)?.messages || []).map(m => {
				if (m.id !== messageId) return m

				const newUsage: Usage = {
					promptTokens: (m.usage?.promptTokens || 0) + record.usage.promptTokens,
					candidatesTokens: (m.usage?.candidatesTokens || 0) + record.usage.candidatesTokens,
					thinkingTokens: (m.usage?.thinkingTokens || 0) + (record.usage.thinkingTokens || 0),
					totalTokens: (m.usage?.totalTokens || 0) + record.usage.totalTokens
				}

				return {
					...m,
					usage: newUsage,
					cost: (m.cost || 0) + record.cost
				}
			})
		})
		return !!result
	}

	async updateThreadNodePositions(threadId: string, positions: Record<string, { x: number; y: number }>): Promise<boolean> {
		const result = await this.updateThread(threadId, {
			nodePositions: positions
		})
		return !!result
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
				this.saveThread(thread)
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

	// Traverse the node tree backwards via editRefId as the parent link to form an isolated branch context
	getBranchContext(threadId: string, messageId?: string): string {
		const thread = this.getThread(threadId)
		if (!thread) return ''

		if (!messageId) {
			return this.getThreadContext(threadId)
		}

		const branchMessages: Message[] = []
		let currentMsgId: string | undefined = messageId

		while (currentMsgId) {
			const msg = thread.messages.find(m => m.id === currentMsgId)
			if (!msg) break
			
			branchMessages.push(msg)
			currentMsgId = msg.editRefId
		}

		// Array is constructed backward (leaf to root), reverse it chronologically
		branchMessages.reverse()

		return branchMessages.map(m => {
			let content = `${m.role.toUpperCase()}: ${m.content}`
			if (m.timeline && m.timeline.length > 0) {
				const timelineText = m.timeline.map(t => `[${t.start} - ${t.end}] ${t.text}`).join('\n')
				content += `\n(AI Generated Timeline):\n${timelineText}`
			}
			return content
		}).join('\n\n')
	}

	// Get the last user message in a thread
	getLatestUserMessage(threadId: string): Message | null {
		const thread = this.getThread(threadId)
		if (!thread) return null
		return [...thread.messages].reverse().find(m => m.role === MessageRole.User) || null
	}

	// Remove a message from a thread and all its descendants recursively
	async removeMessageBranchFromThread(threadId: string, messageId: string): Promise<boolean> {
		const thread = this.getThread(threadId)
		if (!thread) return false

		const toRemove = new Set<string>()
		const collect = (id: string) => {
			if (toRemove.has(id)) return
			toRemove.add(id)
			const children = thread.messages.filter(m => m.editRefId === id)
			children.forEach(c => collect(c.id))
		}

		collect(messageId)

		// Delete associated files for all messages in the branch (except original)
		for (const id of toRemove) {
			const msg = thread.messages.find(m => m.id === id)
			if (msg && msg.files) {
				for (const file of msg.files) {
					if (file.type !== FileType.Original) {
						this.deleteFile(file.url)
					}
				}
			}
		}

		const result = await this.updateThread(threadId, {
			messages: thread.messages.filter(m => !toRemove.has(m.id))
		})

		return !!result
	}
}

export const threadManager = new ThreadManager()
