import { join } from 'path'
import { YtDlp } from 'ytdlp-nodejs'
import fs from 'fs'

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
	} catch (e) {
		console.error('Failed to fetch formats:', e)
		throw new Error('Failed to fetch video formats')
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

	if (resolution && resolution !== 'Best') {
		// Use the same format logic as before if needed, or use quality()
		// The previous logic was: bestvideo[height<=RES][ext=mp4]+bestaudio[ext=m4a]/best[height<=RES][ext=mp4]/best
		// ytdlp-nodejs has quality() but it's simpler. Let's keep the more specific format string for better control
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
		
		const downloadedFilePath = result.filePaths?.[0]
		
		if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
			const name = downloadedFilePath.split(/[/\\]/).pop() || 'Downloaded Video.mp4'
			return { path: downloadedFilePath, name }
		}

		// Fallback: scan the temp directory
		const files = fs.readdirSync(tempFolder)
		if (files.length > 0) {
			const fileStr = files[0]
			const path = join(tempFolder, fileStr)
			return { path, name: fileStr }
		}

		throw new Error('No files found in temp folder after download')
	} catch (error: any) {
		console.error('Download failed:', error)
		throw new Error(`yt-dlp download failed: ${error.message}`)
	}
}

