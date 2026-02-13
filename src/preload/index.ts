import { contextBridge, ipcRenderer } from 'electron'

const api = {
	selectVideo: () => ipcRenderer.invoke('select-video'),
	startPipeline: (data: { messageId: string; videoPath?: string }) =>
		ipcRenderer.invoke('start-pipeline', data),
	onPipelineUpdate: (callback: (data: any) => void) => {
		const listener = (_event: any, data: any) => callback(data)
		ipcRenderer.on('pipeline-update', listener)
		return () => ipcRenderer.removeListener('pipeline-update', listener)
	},
	getTempDir: () => ipcRenderer.invoke('get-temp-dir'),
	setTempDir: () => ipcRenderer.invoke('set-temp-dir'),
	openTempDir: () => ipcRenderer.invoke('open-temp-dir'),
	getGeminiApiKey: () => ipcRenderer.invoke('get-gemini-api-key'),
	setGeminiApiKey: (key: string) => ipcRenderer.invoke('set-gemini-api-key', key)
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
