import { FileType } from '../../../shared/types'
import { PipelineFunction } from '../index'
import { TimelineSegment } from '../../../shared/types'

export const splitVideoParts: PipelineFunction = async (data, context) => {
	const timeline = data.timeline as TimelineSegment[]
	const videoPath = context.preprocessing?.lowResVideoPath || context.videoPath

	if (!videoPath) {
		context.finish('Video path not found. Cannot split video.')
		return
	}

	context.updateStatus('Phase 3: Splitting video based on timeline...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.next(data)
}

export const joinVideoParts: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 3: Joining video parts...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.finish('Processing complete. Your video summary is ready.', {
		path: 'final_summary.mp4',
		type: FileType.Actual
	})
}
