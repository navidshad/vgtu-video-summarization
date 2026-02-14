import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
import { join, basename, extname } from 'path'
import { TimelineSegment } from '../../shared/types'

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
 * Gets the duration of a video file in seconds.
 */
export async function getVideoDuration(filePath: string): Promise<number> {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(filePath, (err, metadata) => {
			if (err) return reject(err)
			const duration = metadata.format.duration
			if (duration === undefined) {
				return reject(new Error('Duration missing from metadata'))
			}
			resolve(duration)
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

/**
 * Assembles a summary video from segments identified in the timeline.
 * Uses a complex filter to avoid temporary files and ensure efficiency.
 */
export async function assembleVideo(
	videoPath: string,
	segments: TimelineSegment[],
	outputDir: string,
	onProgress?: (percent: number) => void
): Promise<string> {
	const filename = basename(videoPath, extname(videoPath))
	const outputPath = join(outputDir, `${filename}_summary.mp4`)

	if (segments.length === 0) {
		throw new Error('No segments provided for assembly')
	}

	// Helper to parse SRT-style time string or simplified HH:MM:SS to seconds
	const timeToSeconds = (t: string): number => {
		const [time, milli] = t.split(/[.,]/)
		const parts = time.split(':').map(Number)
		let seconds = 0
		if (parts.length === 3) {
			seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
		} else if (parts.length === 2) {
			seconds = parts[0] * 60 + parts[1]
		} else if (parts.length === 1) {
			seconds = parts[0]
		}
		return seconds + (milli ? parseFloat(`0.${milli}`) : 0)
	}

	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(videoPath, (err, metadata) => {
			if (err) return reject(new Error(`Failed to probe video: ${err.message}`))

			const hasAudio = metadata.streams.some((s) => s.codec_type === 'audio')
			let command = ffmpeg(videoPath)

			// Create filter description for trimming and concatenating
			let filter = ''
			let concatInputs = ''

			segments.forEach((seg, i) => {
				const startSec = timeToSeconds(seg.start)
				const endSec = timeToSeconds(seg.end)
				const duration = endSec - startSec

				// Add video trim and sync
				filter += `[0:v]trim=start=${startSec}:duration=${duration},setpts=PTS-STARTPTS,format=yuv420p[v${i}];`
				concatInputs += `[v${i}]`

				if (hasAudio) {
					// Add audio trim and sync
					filter += `[0:a]atrim=start=${startSec}:duration=${duration},asetpts=PTS-STARTPTS[a${i}];`
					concatInputs += `[a${i}]`
				}
			})

			// Interleaved concat is better for sync: [v0][a0][v1][a1]...concat=n=N:v=1:a=1
			filter += `${concatInputs}concat=n=${segments.length}:v=1:a=${hasAudio ? 1 : 0}[outv]${hasAudio ? '[outa]' : ''}`

			command.complexFilter(filter).map('[outv]')
			if (hasAudio) {
				command.map('[outa]')
			}

			command
				.output(outputPath)
				.outputOptions([
					'-c:v libx264',
					'-preset fast',
					'-crf 23',
					'-c:a aac',
					'-b:a 128k',
					'-movflags +faststart' // Good for web playback
				])
				.on('start', (cmd) => {
					console.log('FFmpeg logic:', cmd)
				})
				.on('progress', (progress) => {
					if (onProgress && progress.percent) {
						onProgress(Math.round(progress.percent))
					}
				})
				.on('end', () => {
					console.log('Video assembled successfully:', outputPath)
					resolve(outputPath)
				})
				.on('error', (err) => {
					console.error('FFmpeg assembly error:', err)
					reject(err)
				})
				.run()
		})
	})
}
