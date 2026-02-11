import { contextBridge, ipcRenderer } from 'electron'

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('api', {
			startPipeline: (data: { messageId: string; videoPath?: string }) =>
				ipcRenderer.invoke('start-pipeline', data),
			onPipelineUpdate: (callback: (data: any) => void) => {
				const listener = (_event: any, data: any) => callback(data)
				ipcRenderer.on('pipeline-update', listener)
				return () => ipcRenderer.removeListener('pipeline-update', listener)
			}
		})
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-ignore
	window.api = {
		startPipeline: (data: { messageId: string; videoPath?: string }) =>
			ipcRenderer.invoke('start-pipeline', data),
		onPipelineUpdate: (callback: (data: any) => void) => {
			const listener = (_event: any, data: any) => callback(data)
			ipcRenderer.on('pipeline-update', listener)
			return () => ipcRenderer.removeListener('pipeline-update', listener)
		}
	}
}
