import { BrowserWindow } from 'electron'

export type PipelineFunction = (data: any, context: PipelineContext) => Promise<void> | void;

export interface PipelineContext {
	updateStatus: (status: string) => void;
	next: (data: any) => void;
	finish: (message: string, videoFile?: string) => void;
}

export class Pipeline {
	private steps: PipelineFunction[] = [];
	private currentStepIndex = 0;
	private browserWindow: BrowserWindow;
	private aiMessageId: string;

	constructor(browserWindow: BrowserWindow, aiMessageId: string) {
		this.browserWindow = browserWindow;
		this.aiMessageId = aiMessageId;
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
				this.browserWindow.webContents.send('pipeline-update', {
					id: this.aiMessageId,
					type: 'status',
					content: status
				});
			},
			next: (nextData: any) => {
				this.currentStepIndex++;
				this.runStep(nextData);
			},
			finish: (message: string, videoFile?: string) => {
				this.browserWindow.webContents.send('pipeline-update', {
					id: this.aiMessageId,
					type: 'finish',
					content: message,
					videoFile
				});
			}
		};

		try {
			await fn(data, context);
		} catch (error) {
			console.error('Pipeline step failed:', error);
			context.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
