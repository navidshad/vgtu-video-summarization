import { FileType, EnrichedTimelineSegment } from '../../../shared/types'
import { PipelineFunction } from '../index'
import { assembleVideo } from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { THREAD_DIRS } from '../../constants/paths'

export const assembleVideoFromTimeline: PipelineFunction = async (data, context) => {
	const timeline = data.timeline as EnrichedTimelineSegment[]
	const videoPath = context.preprocessing.lowResVideoPath || context.videoPath // Use original high-res video for assembly

	if (!videoPath) {
		context.finish('Video path not found. Cannot assemble video.')
		return
	}

	if (!timeline || timeline.length === 0) {
		context.finish('Timeline is empty. Nothing to assemble.')
		return
	}

	context.updateStatus('Assembling video from timeline...')

	try {
		const resultsDir = path.join(context.tempDir, THREAD_DIRS.GENERATED_VIDEOS)
		if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true })

		const outputPath = await assembleVideo(
			videoPath,
			timeline,
			resultsDir,
			context.messageId,
			(percent) => {
				context.updateStatus(`Assembling video (${percent}%)...`)
			},
			context.signal
		)

		context.finish('Processing complete. Your video is ready.', {
			path: outputPath,
			type: FileType.Preview
		}, timeline, { shouldVersion: true })
	} catch (error) {
		if (!context.signal.aborted) {
			console.error('Assembly failed:', error)
		}
		context.finish('Video assembly failed.')
	}
}
