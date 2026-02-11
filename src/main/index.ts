import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { Pipeline } from './pipeline'
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

	ipcMain.handle('start-pipeline', async (event, { messageId, videoPath }) => {
		const window = BrowserWindow.fromWebContents(event.sender)
		if (!window) return

		const pipeline = new Pipeline(window, messageId)

		pipeline
			.register(extraction.convertToAudio)
			.register(extraction.extractTranscript)
			.register(extraction.extractSceneTiming)
			.register(extraction.generateSceneDescription)
			.register(generation.buildShorterTimeline)
			.register(assembly.splitVideoParts)
			.register(assembly.joinVideoParts)

		await pipeline.start({ videoPath })
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
