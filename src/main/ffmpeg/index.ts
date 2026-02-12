import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
import { join, basename, extname } from 'path'

// Set path to ffmpeg and ffprobe binaries
if (ffmpegPath) {
	const p = typeof ffmpegPath === 'string' ? ffmpegPath : (ffmpegPath as any).path
	ffmpeg.setFfmpegPath(p)
}
if (ffprobePath) {
	const p = typeof ffprobePath === 'string' ? ffprobePath : (ffprobePath as any).path
	ffmpeg.setFfprobePath(p)
}

export interface VideoInfo {
	width: number
	height: number
}

/**
 * Gets the resolution of a video file.
 */
export async function getVideoResolution(filePath: string): Promise<VideoInfo> {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(filePath, (err, metadata) => {
			if (err) return reject(err)
			const stream = metadata.streams.find((s) => s.codec_type === 'video')
			if (!stream || !stream.width || !stream.height) {
				return reject(new Error('No video stream found or dimensions missing'))
			}
			resolve({
				width: stream.width,
				height: stream.height
			})
		})
	})
}

/**
 * Returns true if the video resolution is 480p or lower.
 */
export async function isVideoLowResolution(filePath: string): Promise<boolean> {
	try {
		const { height } = await getVideoResolution(filePath)
		return height <= 480
	} catch (error) {
		console.error('Error checking video resolution:', error)
		return false // Assume not low resolution on error
	}
}

/**
 * Converts video to low resolution (480p).
 */
export async function toLowResolution(
	filePath: string,
	outputDir: string,
	onProgress?: (percent: number) => void
): Promise<string> {
	const filename = basename(filePath, extname(filePath))
	const outputPath = join(outputDir, `${filename}_480p.mp4`)

	return new Promise((resolve, reject) => {
		ffmpeg(filePath)
			.outputOptions(['-vf', 'scale=-2:480']) // Scale to 480p height, maintain aspect ratio (width even)
			.output(outputPath)
			.on('progress', (progress) => {
				if (onProgress && progress.percent) {
					onProgress(Math.round(progress.percent))
				}
			})
			.on('end', () => resolve(outputPath))
			.on('error', (err) => reject(err))
			.run()
	})
}

/**
 * Extracts audio from a video file.
 */
export async function toAudio(
	filePath: string,
	outputDir: string,
	onProgress?: (percent: number) => void
): Promise<string> {
	const filename = basename(filePath, extname(filePath))
	const outputPath = join(outputDir, `${filename}.mp3`)

	return new Promise((resolve, reject) => {
		ffmpeg(filePath)
			.toFormat('mp3')
			.output(outputPath)
			.on('progress', (progress) => {
				if (onProgress && progress.percent) {
					onProgress(Math.round(progress.percent))
				}
			})
			.on('end', () => resolve(outputPath))
			.on('error', (err) => reject(err))
			.run()
	})
}
