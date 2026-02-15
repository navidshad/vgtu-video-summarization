import { BrowserWindow } from 'electron'
import { FileType, Thread, Message } from '../../shared/types'

export type PipelineFunction = (data: any, context: PipelineContext) => Promise<void> | void;

import { threadManager } from '../threads'

export interface PipelineContext {
	updateStatus: (status: string) => void;
	next: (data: any) => void;
	finish: (message: string, video?: { path: string; type: FileType.Preview | FileType.Actual }, timeline?: any, options?: { version?: number; shouldVersion?: boolean }) => void;
	savePreprocessing: (updates: Partial<Thread['preprocessing']>) => void;
	recordUsage: (record: import('../../shared/types').UsageRecord) => void;
	threadId: string;
	videoPath: string;
	tempDir: string;
	preprocessing: Thread['preprocessing'];
	messageId: string;
	baseTimeline?: any; // The timeline to based this generation on
	context: string;   // Full conversation history as text
	editRefId?: string; // ID of the message being edited/referenced
	intentResult?: import('../../shared/types').IntentResult;
}

export class Pipeline {
	private steps: { fn: PipelineFunction; options?: { skipIf?: (context: PipelineContext) => boolean } }[] = []
	private currentStepIndex = 0
	private browserWindow: BrowserWindow
	private messageId: string
	private threadId: string
	private context: string
	private editRefId?: string
	private baseTimeline?: any
	private intentResult?: import('../../shared/types').IntentResult

	constructor(browserWindow: BrowserWindow, messageId: string, threadId: string, context: string, baseTimeline?: any, editRefId?: string) {
		this.browserWindow = browserWindow
		this.messageId = messageId
		this.threadId = threadId
		this.context = context
		this.baseTimeline = baseTimeline
		this.editRefId = editRefId
	}

	register(fn: PipelineFunction, options?: { skipIf?: (context: PipelineContext) => boolean }): this {
		this.steps.push({ fn, options });
		return this;
	}

	async start(initialData: any): Promise<void> {
		this.currentStepIndex = 0;
		if (this.steps.length > 0) {
			await this.runStep(initialData);
		}
	}

	private async runStep(data: any): Promise<void> {
		if (this.currentStepIndex >= this.steps.length) {
			return;
		}

		const thread = threadManager.getThread(this.threadId)
		if (!thread) {
			console.error(`Thread ${this.threadId} not found during pipeline execution`)
			return
		}

		const step = this.steps[this.currentStepIndex];

		// check if we should skip this step
		if (step.options?.skipIf) {
			const contextForCheck: PipelineContext = {
				threadId: this.threadId,
				videoPath: thread.videoPath,
				tempDir: thread.tempDir,
				preprocessing: thread.preprocessing,
				messageId: this.messageId,
				context: this.context,
				baseTimeline: undefined, // baseTimeline is not ready/needed for this check usually, or we can resolve it if needed. 
				// Minimally mocking the context for the check.
				// However, if skipIf depends on baseTimeline, we need to resolve it early.
				// Let's copy the full context resolution logic or move it up.
				// Better to resolve context once.
				updateStatus: () => { },
				next: () => { },
				finish: () => { },
				savePreprocessing: () => { },
				recordUsage: () => { }
			}

			// We need the REAL context to check conditions properly (especially `preprocessing` which is there)
			// But creating the full context object (with callbacks) before checking skip might be needed.
		}

		const self = this
		const context: PipelineContext = {
			threadId: this.threadId,
			videoPath: thread.videoPath,
			tempDir: thread.tempDir,
			preprocessing: thread.preprocessing,
			messageId: this.messageId,
			context: this.context,
			editRefId: this.editRefId,
			baseTimeline: this.baseTimeline,
			get intentResult() { return self.intentResult },
			set intentResult(val) { self.intentResult = val },
			updateStatus: (status: string) => {
				// Send update to UI
				this.browserWindow.webContents.send('pipeline-update', {
					id: this.messageId,
					type: 'status',
					content: status
				})

				// Persist to Thread
				if (this.threadId) {
					threadManager.updateMessageInThread(this.threadId, this.messageId, {
						content: status,
						isPending: true
					})
				}
			},
			recordUsage: (record: import('../../shared/types').UsageRecord) => {
				if (this.threadId) {
					threadManager.updateMessageUsage(this.threadId, this.messageId, record)

					// Send update to UI for real-time cost display
					const updatedThread = threadManager.getThread(this.threadId)
					const updatedMessage = updatedThread?.messages.find(m => m.id === this.messageId)

					if (updatedMessage) {
						this.browserWindow.webContents.send('pipeline-update', {
							id: this.messageId,
							type: 'usage',
							usage: updatedMessage.usage,
							cost: updatedMessage.cost
						})
					}
				}
			},
			savePreprocessing: (updates: Partial<Thread['preprocessing']>) => {
				if (this.threadId) {
					const currentThread = threadManager.getThread(this.threadId)
					if (currentThread) {
						threadManager.updateThread(this.threadId, {
							preprocessing: {
								...(currentThread.preprocessing || {}),
								...updates
							}
						})
					}
				}
			},
			next: (nextData: any) => {
				this.currentStepIndex++
				this.runStep(nextData)
			},
			finish: (message: string, video?: { path: string; type: FileType.Preview | FileType.Actual }, timeline?: any, options?: { version?: number, shouldVersion?: boolean }) => {
				let finalVersion: number | undefined = undefined

				if (options?.version) {
					finalVersion = options.version
				} else if (options?.shouldVersion && this.threadId) {
					finalVersion = threadManager.getNextVersion(this.threadId)
				}

				// Send finish to UI
				this.browserWindow.webContents.send('pipeline-update', {
					id: this.messageId,
					type: 'finish',
					content: message,
					video,
					timeline,
					version: finalVersion
				})

				// Persist to Thread
				if (this.threadId) {
					const updates: Partial<Message> = {
						content: message,
						isPending: false,
						timeline,
						version: finalVersion
					}

					if (video) {
						updates.files = [{ url: video.path, type: video.type }]
					}

					threadManager.updateMessageInThread(this.threadId, this.messageId, updates)
				}
			}
		}

		// Check skip condition
		if (step.options?.skipIf && step.options.skipIf(context)) {
			// Skip this step and proceed to next immediately with SAME data
			this.currentStepIndex++
			this.runStep(data)
			return
		}

		try {
			await step.fn(data, context);
		} catch (error) {
			console.error('Pipeline step failed:', error);
			context.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}