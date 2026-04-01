import { spawn } from 'child_process'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

export async function checkYtDlpAvailability(): Promise<boolean> {
	return new Promise((resolve) => {
		const process = spawn('yt-dlp', ['--version'])

		process.on('close', (code) => {
			resolve(code === 0)
		})

		process.on('error', () => {
			resolve(false)
		})
	})
}

export async function getVideoFormats(url: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const ytProcess = spawn('yt-dlp', [
			'--no-playlist',
			'-J',
			url
		])

		let output = ''
		let errorOutput = ''

		ytProcess.stdout.on('data', (data) => {
			output += data.toString()
		})

		ytProcess.stderr.on('data', (data) => {
			errorOutput += data.toString()
		})

		ytProcess.on('close', (code) => {
			if (code === 0) {
				try {
					const data = JSON.parse(output)
					const formats = data.formats || []
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

					resolve(sortedHeights.length > 0 ? sortedHeights : ['Best'])
				} catch (e) {
					reject(new Error('Failed to parse yt-dlp output'))
				}
			} else {
				reject(new Error(`yt-dlp failed to fetch formats: ${errorOutput}`))
			}
		})
	})
}

export async function downloadVideo(url: string, tempFolder: string, resolution?: string): Promise<{ path: string; name: string }> {
	return new Promise((resolve, reject) => {
		// Output template: tempFolder / videoTitle.ext
		const outputTemplate = join(tempFolder, '%(title)s.%(ext)s')
		
		const formatStr = resolution && resolution !== 'Best' 
			? `bestvideo[height<=${resolution}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${resolution}][ext=mp4]/best`
			: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'

		const ytProcess = spawn('yt-dlp', [
			'--no-playlist',
			'-f', formatStr,
			'-o', outputTemplate,
			'--print', 'after_move:filepath',
			url
		])

		let downloadedFilePath = ''
		let errorOutput = ''

		ytProcess.stdout.on('data', (data) => {
			const str = data.toString().trim()
			if (str && fs.existsSync(str)) {
				// yt-dlp --print after_move:filepath will print the final filepath 
				downloadedFilePath = str
			}
		})

		ytProcess.stderr.on('data', (data) => {
			errorOutput += data.toString()
		})

		ytProcess.on('close', (code) => {
			if (code === 0 && downloadedFilePath && fs.existsSync(downloadedFilePath)) {
				const name = downloadedFilePath.split(/[/\\]/).pop() || 'Downloaded Video.mp4'
				resolve({ path: downloadedFilePath, name })
			} else {
				// Sometimes yt-dlp's print is weird, fallback to scanning the directory
				const files = fs.readdirSync(tempFolder)
				if (files.length > 0) {
					// find the most recently created or just the first media file
					const fileStr = files[0]
					const path = join(tempFolder, fileStr)
					resolve({ path, name: fileStr })
				} else {
					reject(new Error(`yt-dlp failed (code ${code}): ${errorOutput}`))
				}
			}
		})

		ytProcess.on('error', (err) => {
			reject(new Error(`Failed to start yt-dlp: ${err.message}`))
		})
	})
}
