import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { downloadFileWithProgress } from './downloader'

export type DependencyStatus = 'checking' | 'ready' | 'missing' | 'downloading' | 'error'

export interface DependencyInfo {
  name: string
  status: DependencyStatus
  progress: number
  error?: string
}

class DependencyManager {
  private statusMap: Map<string, DependencyInfo> = new Map()

  constructor() {
    this.statusMap.set('yt-dlp', { name: 'yt-dlp', status: 'checking', progress: 0 })
  }

  getStatus(name: string): DependencyInfo | undefined {
    return this.statusMap.get(name)
  }

  updateStatus(name: string, updates: Partial<DependencyInfo>) {
    const info = this.statusMap.get(name)
    if (info) {
      Object.assign(info, updates)
      this.broadcast(info)
    }
  }

  private broadcast(info: DependencyInfo) {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('dependency-update', info)
    })
  }

  async installYtDlp(): Promise<void> {
    const name = 'yt-dlp'
    try {
      this.updateStatus(name, { status: 'downloading', progress: 0 })
      
      const platform = process.platform
      const arch = process.arch
      
      // Determine yt-dlp release filename based on platform
      let filename = 'yt-dlp'
      if (platform === 'darwin') {
        filename = 'yt-dlp_macos'
      } else if (platform === 'win32') {
        filename = arch === 'arm64' ? 'yt-dlp.exe' : (arch === 'x64' ? 'yt-dlp.exe' : 'yt-dlp_x86.exe')
      } else {
        // Linux
        if (arch === 'arm64') filename = 'yt-dlp_linux_aarch64'
        else filename = 'yt-dlp'
      }

      const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${filename}`
      
      // We store the downloaded binary in the app's userData folder to ensure it survives updates
      // and is always executable (not blocked by ASAR).
      const destDir = join(app.getPath('userData'), 'bin')
      const destPath = join(destDir, filename)

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }

      await downloadFileWithProgress(url, destPath, (percent) => {
        this.updateStatus(name, { progress: percent })
      })

      // Ensure it is executable on Unix-like systems
      if (platform !== 'win32') {
        fs.chmodSync(destPath, 0o755)
      }

      this.updateStatus(name, { status: 'ready', progress: 100 })
    } catch (error: any) {
      console.error(`[DependencyManager] Failed to install ${name}:`, error)
      this.updateStatus(name, { status: 'error', error: error.message })
      throw error
    }
  }

  /**
   * Returns the path to the downloaded yt-dlp binary in userData if it exists.
   */
  getDownloadedYtDlpPath(): string | null {
    const platform = process.platform
    let filename = platform === 'darwin' ? 'yt-dlp_macos' : (platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
    const destPath = join(app.getPath('userData'), 'bin', filename)
    
    if (fs.existsSync(destPath)) {
      return destPath
    }
    return null
  }
}

export const dependencyManager = new DependencyManager()
