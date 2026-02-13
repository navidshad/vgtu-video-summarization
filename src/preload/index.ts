import { contextBridge, ipcRenderer } from 'electron'

const api = {
	selectVideo: () => ipcRenderer.invoke('select-video'),
	startPipeline: (data: {
		threadId: string
		messageId: string
		videoPath?: string
		userPrompt?: string
		duration?: number
	}) => ipcRenderer.invoke('start-pipeline', data),
	onPipelineUpdate: (callback: (data: any) => void) => {
		const listener = (_event: any, data: any) => callback(data)
		ipcRenderer.on('pipeline-update', listener)
		return () => ipcRenderer.removeListener('pipeline-update', listener)
	},
	getTempDir: () => ipcRenderer.invoke('get-temp-dir'),
	setTempDir: () => ipcRenderer.invoke('set-temp-dir'),
	openTempDir: () => ipcRenderer.invoke('open-temp-dir'),
	getGeminiApiKey: () => ipcRenderer.invoke('get-gemini-api-key'),
	setGeminiApiKey: (key: string) => ipcRenderer.invoke('set-gemini-api-key', key),
	// Thread Management
	createThread: (videoPath: string, videoName: string) =>
		ipcRenderer.invoke('create-thread', { videoPath, videoName }),
	getAllThreads: () => ipcRenderer.invoke('get-all-threads'),
	getThread: (id: string) => ipcRenderer.invoke('get-thread', id),
	deleteThread: (id: string) => ipcRenderer.invoke('delete-thread', id),
	deleteAllThreads: () => ipcRenderer.invoke('delete-all-threads'),
	addMessage: (threadId: string, message: any) =>
		ipcRenderer.invoke('add-message', { threadId, message })
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
