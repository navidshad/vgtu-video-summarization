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
import * as supply from './pipeline/phases/supply'
import * as assembly from './pipeline/phases/assembly'
import * as thumbnail from './pipeline/phases/thumbnail'
import * as imageExtraction from './pipeline/phases/image-extraction'
import * as imageIntent from './pipeline/phases/image-intent'
import * as imageGeneration from './pipeline/phases/image-generation'
import { backgroundTaskManager } from './tasks'
import { checkFFmpegAvailability, getVideoMetadata } from './ffmpeg'
import { checkScenedetectAvailability } from './scenedetect'
import { checkYtDlpAvailability, downloadVideo, getVideoFormats } from './ytdlp'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

const activePipelines = new Map<string, Pipeline>()

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
	backgroundTaskManager.init()
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
			filters: [{ name: 'Videos', extensions: ['mp4', 'avi', 'mov', 'webm'] }]
		})

		if (result.canceled || result.filePaths.length === 0) {
			return null
		}

		return {
			path: result.filePaths[0],
			name: result.filePaths[0].split('/').pop() || ''
		}
	})

	ipcMain.handle('show-open-dialog', async (_event, options) => {
		return await dialog.showOpenDialog(options)
	})

	ipcMain.handle('check-system-requirements', async () => {
		const [ffmpegAvailable, scenedetectAvailable, ytDlpAvailable] = await Promise.all([
			checkFFmpegAvailability(),
			checkScenedetectAvailability(),
			checkYtDlpAvailability()
		])
		return { 
			ffmpegAvailable, 
			scenedetectAvailable, 
			ytDlpAvailable,
			isTempDirUnsafe: settingsManager.isTempDirUnsafe()
		}
	})

	ipcMain.handle('get-video-metadata', async (_event, filePath: string) => {
		return await getVideoMetadata(filePath)
	})

	ipcMain.handle('fetch-video-formats', async (_event, url: string) => {
		return await getVideoFormats(url)
	})

	ipcMain.handle('download-video', async (event, url: string, resolution?: string) => {
		const tempDir = join(settingsManager.getTempDir(), `download-${Date.now()}`)
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true })
		}
		return await downloadVideo(url, tempDir, resolution, (percent) => {
			event.sender.send('download-progress', percent)
		})
	})

	ipcMain.handle('is-temp-dir-unsafe', () => {
		return settingsManager.isTempDirUnsafe()
	})

	ipcMain.handle('debug-log', (_event, ...args: any[]) => {
		console.log('[FRONTEND LOG]', ...args)
	})

	ipcMain.handle('start-pipeline', async (event, { threadId, newAiMessageId }) => {
		console.log(`\n===============\n[DEBUG IPC] start-pipeline called: threadId=${threadId}, newAiMessageId=${newAiMessageId}`)
		const window = BrowserWindow.fromWebContents(event.sender)
		if (!window) {
			console.log(`[DEBUG IPC] FAILED: window not found`)
			return
		}

		const thread = threadManager.getThread(threadId)
		if (!thread) {
			console.log(`[DEBUG IPC] FAILED: thread not found`)
			return
		}

		// The newly created AI pending message links back to the user prompt via editRefId
		const aiMsg = thread.messages.find(m => m.id === newAiMessageId)
		const userMsgId = aiMsg?.editRefId
		console.log(`[DEBUG IPC] aiMsg found? ${!!aiMsg}, userMsgId=${userMsgId}`)

		// Traverse graph lineage backwards
		const { text: context, attachedImages } = threadManager.getBranchContext(threadId, userMsgId)

		// Prepare the base timeline
		const baseTimeline = userMsgId ? thread.messages.find(m => m.id === userMsgId)?.timeline : undefined;

		const pipeline = new Pipeline(window, newAiMessageId, threadId, context, baseTimeline, userMsgId, attachedImages)

		if (thread.type === 'image') {
			pipeline
				.register(async (data, ctx) => {
					await ctx.updateStatus('Waiting for image analysis...')
					await ctx.waitForTask('imageExtraction')
					ctx.next(data)
				})
				.register(imageIntent.determineImageIntent)
				.register(supply.supplyController, { skipIf: ctx => ctx.intentResult?.type !== 'generate-image' })
				.register(imageGeneration.generateOutputImage, { skipIf: ctx => ctx.intentResult?.type !== 'generate-image' })
		} else {
			pipeline
				.register(extraction.waitForEnsureLowResolution)
				.register(extraction.waitForConvertToAudio)
				.register(extraction.waitForExtractRawTranscript)
				.register(extraction.waitForExtractCorrectedTranscript)
				.register(extraction.waitForExtractSceneTiming)
				.register(extraction.waitForGenerateSceneDescription)
				.register(intent.determineIntent)
				.register(supply.supplyController, { skipIf: ctx => ctx.intentResult?.type === 'text' })
				// These steps only run if intent is generate-timeline
				.register(generation.waitForEnrichTranscript, { skipIf: ctx => ctx.intentResult?.type === 'text' || ctx.intentResult?.type === 'generate-thumbnail' })
				.register(generation.buildShorterTimeline, { skipIf: ctx => ctx.intentResult?.type === 'text' || ctx.intentResult?.type === 'generate-thumbnail' })
				.register(thumbnail.generateThumbnail, { skipIf: ctx => ctx.intentResult?.type !== 'generate-thumbnail' })
				.register(assembly.assembleVideoFromTimeline, { skipIf: ctx => ctx.intentResult?.type === 'text' || ctx.intentResult?.type === 'generate-thumbnail' })
		}

		console.log(`[DEBUG IPC] pipeline configured. Calling pipeline.start() in background...`)
		activePipelines.set(newAiMessageId, pipeline)
		
		pipeline.start({})
			.then(() => {
				console.log(`[DEBUG IPC] pipeline.start() completed successfully!`)
			})
			.catch((e) => {
				console.error(`[DEBUG IPC] pipeline.start() threw error:`, e)
			})
			.finally(() => {
				activePipelines.delete(newAiMessageId)
			})

		return true
	})

	ipcMain.handle('abort-pipeline', async (_event, messageId) => {
		console.log(`[DEBUG IPC] abort-pipeline called for messageId=${messageId}`)
		const pipeline = activePipelines.get(messageId)
		if (pipeline) {
			pipeline.abort()
			return true
		}
		return false
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

		const selectedPath = result.filePaths[0]
		const newPath = join(selectedPath, 'FrameFlow')
		
		if (!fs.existsSync(newPath)) {
			fs.mkdirSync(newPath, { recursive: true })
		}

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
	ipcMain.handle('create-thread', async (_event, { videoPath, videoName, imagePaths }) => {
		const newThread = await threadManager.createThread(videoPath, videoName, imagePaths)
		if (newThread.type === 'image') {
			backgroundTaskManager.startImageProcessing(newThread.id)
		} else {
			backgroundTaskManager.startPreprocessing(newThread.id)
		}
		return newThread
	})

	ipcMain.handle('retry-preprocessing', async (_event, threadId) => {
		await backgroundTaskManager.startPreprocessing(threadId)
		return true
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

	ipcMain.handle('open-thread-dir', async (_event, threadId) => {
		const thread = threadManager.getThread(threadId)
		if (thread && thread.tempDir && fs.existsSync(thread.tempDir)) {
			await shell.openPath(thread.tempDir)
			return true
		}
		return false
	})

	ipcMain.handle('add-message', async (_event, { threadId, message }) => {
		return await threadManager.addMessageToThread(threadId, message)
	})

	ipcMain.handle('remove-message', async (_event, { threadId, messageId }) => {
		return await threadManager.removeMessageBranchFromThread(threadId, messageId)
	})
 
	ipcMain.handle('save-node-positions', async (_event, { threadId, positions }) => {
		return await threadManager.updateThreadNodePositions(threadId, positions)
	})
 
	ipcMain.handle('show-confirmation', async (_event, { title, message, detail, type = 'question', buttons = ['Cancel', 'Yes'], defaultId = 1, cancelId = 0 }) => {
		const focusedWindow = BrowserWindow.getFocusedWindow()
		if (!focusedWindow) return cancelId

		const result = await dialog.showMessageBox(focusedWindow, {
			type: type as any,
			buttons,
			defaultId,
			cancelId,
			title,
			message,
			detail
		})

		return result.response
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