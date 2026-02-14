import { FileType } from '../../../shared/types'
import { PipelineFunction } from '../index'
import { TimelineSegment } from '../../../shared/types'
import { assembleVideo } from '../../ffmpeg'

export const assembleVideoFromTimeline: PipelineFunction = async (data, context) => {
	const timeline = data.timeline as TimelineSegment[]
	const videoPath = context.preprocessing.lowResVideoPath || context.videoPath // Use original high-res video for assembly

	if (!videoPath) {
		context.finish('Video path not found. Cannot assemble video.')
		return
	}

	if (!timeline || timeline.length === 0) {
		context.finish('Timeline is empty. Nothing to assemble.')
		return
	}

	context.updateStatus('Phase 3: Assembling video from timeline...')

	try {
		const outputPath = await assembleVideo(
			videoPath,
			timeline,
			context.tempDir,
			context.messageId,
			(percent) => {
				context.updateStatus(`Phase 3: Assembling video (${percent}%)...`)
			}
		)

		context.finish('Processing complete. Your video is ready.', {
			path: outputPath,
			type: FileType.Actual
		}, timeline)
	} catch (error) {
		console.error('Assembly failed:', error)
		context.finish('Video assembly failed.')
	}
}
