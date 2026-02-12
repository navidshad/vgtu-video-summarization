import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'

interface Settings {
	tempDir: string
}

class SettingsManager {
	private settingsPath: string
	private settings: Settings

	constructor() {
		const userDataPath = app.getPath('userData')
		this.settingsPath = join(userDataPath, 'settings.json')
		this.settings = this.loadSettings()
	}

	private loadSettings(): Settings {
		const defaultTempDir = join(os.tmpdir(), 'vgtu-video-summarization')

		try {
			if (existsSync(this.settingsPath)) {
				const data = readFileSync(this.settingsPath, 'utf-8')
				const parsed = JSON.parse(data)
				return {
					tempDir: parsed.tempDir || defaultTempDir
				}
			}
		} catch (error) {
			console.error('Failed to load settings:', error)
		}

		return { tempDir: defaultTempDir }
	}

	private saveSettings(): void {
		try {
			writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2))
		} catch (error) {
			console.error('Failed to save settings:', error)
		}
	}

	getTempDir(): string {
		const dir = this.settings.tempDir
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true })
		}
		return dir
	}

	setTempDir(path: string): void {
		this.settings.tempDir = path
		this.saveSettings()

		if (!existsSync(path)) {
			mkdirSync(path, { recursive: true })
		}
	}
}

export const settingsManager = new SettingsManager()
