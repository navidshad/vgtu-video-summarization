import { contextBridge, ipcRenderer } from 'electron'

const api = {
	selectVideo: () => ipcRenderer.invoke('select-video'),
	checkSystemRequirements: () => ipcRenderer.invoke('check-system-requirements'),
	startPipeline: (data: { threadId: string; userPromptMessageId: string; newAiMessageId: string; editReferenceMessageId?: string }) =>
		ipcRenderer.invoke('start-pipeline', data),
	onPipelineUpdate: (callback: (data: any) => void) => {
		const listener = (_event: any, data: any) => callback(data)
		ipcRenderer.on('pipeline-update', listener)
		return () => ipcRenderer.removeListener('pipeline-update', listener)
	},
	getTempDir: () => ipcRenderer.invoke('get-temp-dir'),
	setTempDir: () => ipcRenderer.invoke('set-temp-dir'),
	resetTempDir: () => ipcRenderer.invoke('reset-temp-dir'),
	openTempDir: () => ipcRenderer.invoke('open-temp-dir'),
	getGeminiApiKey: () => ipcRenderer.invoke('get-gemini-api-key'),
	setGeminiApiKey: (key: string) => ipcRenderer.invoke('set-gemini-api-key', key),
	getModelSettings: () => ipcRenderer.invoke('get-model-settings'),
	setModelSettings: (settings: any) => ipcRenderer.invoke('set-model-settings', settings),
	resetModelSettings: () => ipcRenderer.invoke('reset-model-settings'),
	// Thread Management
	createThread: (videoPath: string, videoName: string) =>
		ipcRenderer.invoke('create-thread', { videoPath, videoName }),
	getAllThreads: () => ipcRenderer.invoke('get-all-threads'),
	getThread: (id: string) => ipcRenderer.invoke('get-thread', id),
	deleteThread: (id: string) => ipcRenderer.invoke('delete-thread', id),
	deleteAllThreads: () => ipcRenderer.invoke('delete-all-threads'),
	addMessage: (threadId: string, message: any) =>
		ipcRenderer.invoke('add-message', { threadId, message }),
	removeMessage: (threadId: string, messageId: string) =>
		ipcRenderer.invoke('remove-message', { threadId, messageId }),
	showConfirmation: (options: { title: string, message: string, detail?: string, type?: string, buttons?: string[], defaultId?: number, cancelId?: number }) =>
		ipcRenderer.invoke('show-confirmation', options),
	saveVideo: (sourcePath: string) => ipcRenderer.invoke('save-video', sourcePath),
	openThreadDir: (threadId: string) => ipcRenderer.invoke('open-thread-dir', threadId)
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error('[Preload] Failed to expose API:', error)
	}
} else {
	// @ts-ignore
	window.api = api
}