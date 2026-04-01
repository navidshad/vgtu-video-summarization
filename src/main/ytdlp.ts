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

export async function downloadVideo(url: string, tempFolder: string): Promise<{ path: string; name: string }> {
	return new Promise((resolve, reject) => {
		// Output template: tempFolder / videoTitle.ext
		const outputTemplate = join(tempFolder, '%(title)s.%(ext)s')
		
		const ytProcess = spawn('yt-dlp', [
			'--no-playlist',
			'-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
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
