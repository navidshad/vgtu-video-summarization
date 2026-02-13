import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'

interface Settings {
	tempDir: string
	geminiApiKey?: string
}

class SettingsManager {
	private settingsPath: string
	private settings: Settings
	private defaultTempDir: string

	constructor() {
		const userDataPath = app.getPath('userData')
		this.settingsPath = join(userDataPath, 'settings.json')
		this.defaultTempDir = join(os.tmpdir(), 'vgtu-video-summarization')
		this.settings = this.loadSettings()
	}

	private loadSettings(): Settings {

		try {
			if (existsSync(this.settingsPath)) {
				const data = readFileSync(this.settingsPath, 'utf-8')
				const parsed = JSON.parse(data)
				return {
					tempDir: parsed.tempDir || this.defaultTempDir,
					geminiApiKey: parsed.geminiApiKey
				}
			}
		} catch (error) {
			console.error('Failed to load settings:', error)
		}

		return { tempDir: this.defaultTempDir }
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

	resetTempDir(): string {
		this.settings.tempDir = this.defaultTempDir
		this.saveSettings()

		if (!existsSync(this.defaultTempDir)) {
			mkdirSync(this.defaultTempDir, { recursive: true })
		}

		return this.defaultTempDir
	}

	getGeminiApiKey(): string | undefined {
		return this.settings.geminiApiKey
	}

	setGeminiApiKey(key: string): void {
		this.settings.geminiApiKey = key
		this.saveSettings()
	}
}

export const settingsManager = new SettingsManager()
