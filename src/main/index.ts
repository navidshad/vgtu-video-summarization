import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { net } from 'electron'
import * as fs from 'fs'
import { basename, extname, join } from 'path'
import { pathToFileURL } from 'url'
import { Pipeline } from './pipeline'
import { settingsManager } from './settings'
import { threadManager } from './threads'
import * as extraction from './pipeline/phases/extraction'
import * as generation from './pipeline/phases/generation'
import * as intent from './pipeline/phases/intent'
import * as assembly from './pipeline/phases/assembly'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'media',
		privileges: {
			secure: true,
			supportFetchAPI: true,
			bypassCSP: true,
			stream: true,
			standard: true,
			corsEnabled: true
		}
	}
])

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
	protocol.registerFileProtocol('media', (request, callback) => {
		try {
			const url = new URL(request.url)
			// Consolidate hostname and pathname (handles both media://var/... and media:///var/...)
			let rawPath = decodeURIComponent(url.hostname + url.pathname)

			// If path already contained file:// prefix, clean it up
			let filePath = rawPath.replace(/^file:\/+/i, '/')

			if (process.platform !== 'win32' && !filePath.startsWith('/')) {
				filePath = '/' + filePath
			}

			callback({ path: filePath })
		} catch (error) {
			console.error('Media protocol error:', error)
			callback({ error: -6 })
		}
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

	ipcMain.handle('start-pipeline', async (event, { threadId, newAiMessageId }) => {
		const window = BrowserWindow.fromWebContents(event.sender)
		if (!window) return

		const thread = threadManager.getThread(threadId)
		if (!thread) return

		// Derive edit reference from the last user message
		const lastUserMsg = threadManager.getLatestUserMessage(threadId)
		const editRefId = lastUserMsg?.editRefId

		// Prepare the context
		// Full thread history is the context for the pipeline
		const context = threadManager.getThreadContext(threadId)

		// Prepare the base timeline
		const baseTimeline = editRefId ? thread.messages.find(m => m.id === editRefId)?.timeline : undefined;

		const pipeline = new Pipeline(window, newAiMessageId, threadId, context, baseTimeline, editRefId)

		pipeline
			.register(extraction.convertToAudio, { skipIf: ctx => !!ctx.preprocessing.audioPath })
			.register(extraction.extractRawTranscript, { skipIf: ctx => !!ctx.preprocessing.rawTranscriptPath })
			.register(intent.determineIntent)
			// These steps only run if intent is generate-timeline (handled by pipeline logic if needed, but here we can add skipIf or the determineIntent can just finish)
			.register(extraction.extractCorrectedTranscript, { skipIf: ctx => !!ctx.preprocessing.correctedTranscriptPath })
			// .register(extraction.ensureLowResolution, { skipIf: ctx => !!ctx.preprocessing.lowResVideoPath })
			// .register(extraction.extractSceneTiming, { skipIf: ctx => ctx.intentResult?.type === 'text' })
			.register(extraction.generateSceneDescription, { skipIf: ctx => ctx.intentResult?.type === 'text' })
			.register(generation.buildShorterTimeline, { skipIf: ctx => ctx.intentResult?.type === 'text' })
			.register(assembly.assembleVideoFromTimeline, { skipIf: ctx => ctx.intentResult?.type === 'text' })

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

	ipcMain.handle('get-model-settings', () => {
		return settingsManager.getModelSettings()
	})

	ipcMain.handle('set-model-settings', (_event, settings: any) => {
		settingsManager.setModelSettings(settings)
	})

	ipcMain.handle('reset-model-settings', () => {
		return settingsManager.resetModelSettings()
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

	ipcMain.handle('save-video', async (_event, sourcePath: string) => {
		const extension = extname(sourcePath)
		const fileName = basename(sourcePath)

		const result = await dialog.showSaveDialog({
			defaultPath: fileName,
			filters: [{ name: 'Videos', extensions: [extension.replace('.', '')] }]
		})

		if (result.canceled || !result.filePath) {
			return null
		}

		try {
			fs.copyFileSync(sourcePath, result.filePath)
			return result.filePath
		} catch (error) {
			console.error('Failed to save video:', error)
			throw error
		}
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