import { BrowserWindow } from 'electron'
import { FileType } from '../../shared/types'

export type PipelineFunction = (data: any, context: PipelineContext) => Promise<void> | void;

export interface PipelineContext {
	updateStatus: (status: string) => void;
	next: (data: any) => void;
	finish: (message: string, video?: { path: string; type: FileType.Preview | FileType.Actual }, timeline?: any) => void;
}

import { threadManager } from '../threads'

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

		const fn = this.steps[this.currentStepIndex];
		const context: PipelineContext = {
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
