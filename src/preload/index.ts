import { contextBridge } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
	try {
		exposeElectronAPI()
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = exposeElectronAPI()
}
