import { BrowserWindow } from 'electron'
import { FileType, Thread } from '../../shared/types'

export type PipelineFunction = (data: any, context: PipelineContext) => Promise<void> | void;

import { threadManager } from '../threads'

export interface PipelineContext {
	updateStatus: (status: string) => void;
	next: (data: any) => void;
	finish: (message: string, video?: { path: string; type: FileType.Preview | FileType.Actual }, timeline?: any) => void;
	savePreprocessing: (updates: Partial<Thread['preprocessing']>) => void;
	threadId: string;
	videoPath: string;
	tempDir: string;
	preprocessing: Thread['preprocessing'];
}

export class Pipeline {
	private steps: PipelineFunction[] = []
	private currentStepIndex = 0
	private browserWindow: BrowserWindow
	private messageId: string
	private threadId: string

	constructor(browserWindow: BrowserWindow, messageId: string, threadId: string) {
		this.browserWindow = browserWindow
		this.messageId = messageId
		this.threadId = threadId
	}

	register(fn: PipelineFunction): this {
		this.steps.push(fn);
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

		const fn = this.steps[this.currentStepIndex];
		const context: PipelineContext = {
			threadId: this.threadId,
			videoPath: thread.videoPath,
			tempDir: thread.tempDir,
			preprocessing: thread.preprocessing,
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
			finish: (message: string, video?: { path: string; type: FileType.Preview | FileType.Actual }, timeline?: any) => {
				// Send finish to UI
				this.browserWindow.webContents.send('pipeline-update', {
					id: this.messageId,
					type: 'finish',
					content: message,
					video,
					timeline
				})

				// Persist to Thread
				if (this.threadId) {
					const updates: any = {
						content: message,
						isPending: false,
						timeline
					}

					if (video) {
						updates.files = [{ url: video.path, type: video.type }]
					}

					threadManager.updateMessageInThread(this.threadId, this.messageId, updates)
				}
			}
		}

		try {
			await fn(data, context);
		} catch (error) {
			console.error('Pipeline step failed:', error);
			context.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
