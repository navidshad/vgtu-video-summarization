import path, { join } from 'path'
import { YtDlp } from 'ytdlp-nodejs'
import fs from 'fs'
import { getFFmpegBinaryPath } from './ffmpeg'

const ytdlp = new YtDlp()

export async function checkYtDlpAvailability(): Promise<boolean> {
	try {
		const isInstalled = await ytdlp.checkInstallationAsync()
		if (!isInstalled) {
			// Try to update/download if not present
			await ytdlp.updateYtDlpAsync()
			return await ytdlp.checkInstallationAsync()
		}
		return true
	} catch (error) {
		console.error('Failed to check or install yt-dlp:', error)
		return false
	}
}

export async function getVideoFormats(url: string): Promise<string[]> {
	try {
		const info = await ytdlp.getInfoAsync(url)
		if (info._type !== 'video') {
			throw new Error('URL is not a single video (possible playlist or channel)')
		}
		const formats = info.formats || []
		const heights = new Set<number>()

		formats.forEach((f: any) => {
			if (f.height && f.height >= 144) {
				heights.add(f.height)
			}
		})

		// Sort descending: 1080, 720, 480...
		const sortedHeights = Array.from(heights)
			.sort((a, b) => b - a)
			.map(h => h.toString())

		return sortedHeights.length > 0 ? sortedHeights : ['Best']
	} catch (e: any) {
		console.error('Failed to fetch formats:', e)
		const message = e.message || 'Unknown error'
		// Specialize message for better UI feedback
		if (message.includes('Unsupported URL')) {
			throw new Error('Unsupported URL: yt-dlp does not support this website.')
		}
		throw new Error(`Failed to fetch video formats: ${message}`)
	}
}

export async function downloadVideo(
	url: string, 
	tempFolder: string, 
	resolution?: string,
	onProgress?: (percent: number) => void
): Promise<{ path: string; name: string }> {
	// Output template: tempFolder / videoTitle.ext
	const outputTemplate = join(tempFolder, '%(title)s.%(ext)s')
	
	const builder = ytdlp.download(url)
		.output(outputTemplate)
		.addArgs('--no-playlist')
		.addArgs('--ffmpeg-location', getFFmpegBinaryPath())

	if (resolution && resolution !== 'Best') {
		// quality() logic
		const formatStr = `bestvideo[height<=${resolution}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${resolution}][ext=mp4]/best`
		builder.addArgs('-f', formatStr)
	} else {
		const formatStr = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
		builder.addArgs('-f', formatStr)
	}

	if (onProgress) {
		builder.on('progress', (p) => {
			if (p.percentage !== undefined) {
				onProgress(p.percentage)
			}
		})
	}

	try {
		const result = await builder.run()
		
		let downloadedPath = result.filePaths?.[0]
		
		// 0. Safety: Check if we got anything
		if (!downloadedPath || !fs.existsSync(downloadedPath)) {
			// Fallback: scan the temp directory
			const files = fs.readdirSync(tempFolder)
			if (files.length > 0) {
				downloadedPath = join(tempFolder, files[0])
			}
		}

		if (!downloadedPath || !fs.existsSync(downloadedPath)) {
			throw new Error('No files found in temp folder after download')
		}

		// 1. Resolve 'Is a directory' issues
		// If yt-dlp created a directory (e.g. for folder link or failed merge), find the biggest file or merged file
		if (fs.statSync(downloadedPath).isDirectory()) {
			console.log(`[YTDLP] Download result is a directory: ${downloadedPath}. Resolving to flat file...`)
			const files = fs.readdirSync(downloadedPath)
				.map(f => ({ name: f, path: join(downloadedPath!, f), size: fs.statSync(join(downloadedPath!, f)).size }))
				.filter(f => !fs.statSync(f.path).isDirectory())
				.sort((a, b) => b.size - a.size) // Pick biggest file (likely the video)

			if (files.length === 0) {
				throw new Error('yt-dlp download failed: Result was an empty directory')
			}

			const bestFile = files[0]
			const newPath = join(tempFolder, bestFile.name)
			fs.renameSync(bestFile.path, newPath)
			
			// Cleanup the directory if it's now empty or just temp fragments
			try { fs.rmSync(downloadedPath, { recursive: true, force: true }) } catch (e) {}
			
			downloadedPath = newPath
		}

		// 2. Normalize filename
		const dir = path.dirname(downloadedPath)
		const originalFileName = path.basename(downloadedPath)
		
		// Robust normalization: strip redundant extensions
		const ext = path.extname(originalFileName)
		let base = path.basename(originalFileName, ext)
		
		// Keep stripping common video extensions from the end of the base name
		const videoExtensions = ['.mp4', '.m4a', '.webm', '.mov', '.mkv', '.avi', '.f136', '.f140', '.f251']
		while (true) {
			const subExt = path.extname(base)
			if (!subExt) break
			if (videoExtensions.includes(subExt.toLowerCase()) || subExt.match(/^\.f\d+$/)) {
				base = path.basename(base, subExt)
			} else {
				break
			}
		}
		
		const newFileName = `${base.trim()}${ext}`
		let finalPath = downloadedPath
		let finalName = originalFileName

		if (newFileName !== originalFileName) {
			const newPath = join(dir, newFileName)
			if (!fs.existsSync(newPath)) {
				fs.renameSync(downloadedPath, newPath)
				finalPath = newPath
				finalName = newFileName
			}
		}

		return { path: finalPath, name: finalName }
	} catch (error: any) {
		console.error('Download failed:', error)
		throw new Error(`yt-dlp download failed: ${error.message}`)
	}
}



