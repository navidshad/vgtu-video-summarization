import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { Pipeline } from './pipeline'
import { settingsManager } from './settings'
import { threadManager } from './threads'
import * as extraction from './pipeline/phases/extraction'
import * as generation from './pipeline/phases/generation'
import * as assembly from './pipeline/phases/assembly'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, '../preload/index.cjs'),
			sandbox: false
		}
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}
}

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron')

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()

	ipcMain.handle('select-video', async () => {
		const result = await dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{ name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] }]
		})

		if (result.canceled || result.filePaths.length === 0) {
			return null
		}

		return {
			path: result.filePaths[0],
			name: result.filePaths[0].split('/').pop() || ''
		}
	})

	ipcMain.handle('start-pipeline', async (event, { threadId, messageId, videoPath, userPrompt, duration }) => {
		const window = BrowserWindow.fromWebContents(event.sender)
		if (!window) return

		const pipeline = new Pipeline(window, messageId, threadId)

		pipeline
			.register(extraction.ensureLowResolution)
			.register(extraction.convertToAudio)
			.register(extraction.extractTranscript)
			.register(extraction.extractSceneTiming)
			.register(extraction.generateSceneDescription)
			.register(generation.buildShorterTimeline)
			.register(assembly.splitVideoParts)
			.register(assembly.joinVideoParts)

		await pipeline.start({ videoPath, userPrompt, duration })
	})

	ipcMain.handle('get-temp-dir', () => {
		return settingsManager.getTempDir()
	})

	ipcMain.handle('set-temp-dir', async () => {
		const result = await dialog.showOpenDialog({
			properties: ['openDirectory', 'createDirectory']
		})

		if (result.canceled || result.filePaths.length === 0) {
			return null
		}

		const newPath = result.filePaths[0]
		settingsManager.setTempDir(newPath)
		return newPath
	})

	ipcMain.handle('open-temp-dir', async () => {
		const dir = settingsManager.getTempDir()
		await shell.openPath(dir)
	})

	ipcMain.handle('get-gemini-api-key', () => {
		return settingsManager.getGeminiApiKey()
	})

	ipcMain.handle('set-gemini-api-key', (_event, key: string) => {
		settingsManager.setGeminiApiKey(key)
	})

	// Thread Management
	ipcMain.handle('create-thread', async (_event, { videoPath, videoName }) => {
		return threadManager.createThread(videoPath, videoName)
	})

	ipcMain.handle('get-all-threads', () => {
		return threadManager.getAllThreads()
	})

	ipcMain.handle('get-thread', (_event, id) => {
		return threadManager.getThread(id)
	})

	ipcMain.handle('delete-thread', (_event, id) => {
		return threadManager.deleteThread(id)
	})

	ipcMain.handle('delete-all-threads', () => {
		return threadManager.deleteAllThreads()
	})

	ipcMain.handle('add-message', (_event, { threadId, message }) => {
		return threadManager.addMessageToThread(threadId, message)
	})

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
