import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { net } from 'electron'
import { pathToFileURL } from 'url'
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

	// Register custom protocol for local media
	protocol.handle('media', (request) => {
		const url = request.url.replace('media://', '')
		// Decoded path might be needed if there are spaces or special characters
		const decodedPath = decodeURIComponent(url)
		return net.fetch(pathToFileURL(decodedPath).toString())
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

	ipcMain.handle('start-pipeline', async (event, { threadId, newAiMessageId, userPromptMessageId, editReferenceMessageId }) => {
		const window = BrowserWindow.fromWebContents(event.sender)
		if (!window) return

		const thread = threadManager.getThread(threadId)
		if (!thread) return

		// Prepare the context
		// User message is the context for the pipeline
		const context = thread.messages.find(m => m.id === userPromptMessageId)?.content || ''

		// Prepare the base timeline
		const baseTimeline = editReferenceMessageId ? thread.messages.find(m => m.id === editReferenceMessageId)?.timeline : undefined;

		const pipeline = new Pipeline(window, newAiMessageId, threadId, context, baseTimeline)

		pipeline
			.register(extraction.ensureLowResolution, { skipIf: ctx => !!ctx.preprocessing.lowResVideoPath })
			.register(extraction.convertToAudio, { skipIf: ctx => !!ctx.preprocessing.audioPath })
			.register(extraction.extractTranscript, { skipIf: ctx => !!ctx.preprocessing.srtPath })
			.register(extraction.extractSceneTiming)
			.register(extraction.generateSceneDescription)
			.register(generation.buildShorterTimeline)
			.register(assembly.assembleSummary)

		await pipeline.start({})
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

	ipcMain.handle('reset-temp-dir', () => {
		return settingsManager.resetTempDir()
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

	app.on('before-quit', () => {
		threadManager.resetPendingMessages()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})