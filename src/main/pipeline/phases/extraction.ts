import { PipelineFunction } from '../index'
import { settingsManager } from '../../settings'
import * as ffmpegAdapter from '../../ffmpeg'

export const ensureLowResolution: PipelineFunction = async (data, context) => {
	const { videoPath } = data
	context.updateStatus('Phase 1: Checking video resolution...')

	const isLowRes = await ffmpegAdapter.isVideoLowResolution(videoPath)
	if (isLowRes) {
		context.updateStatus('Phase 1: Video is already low resolution.')
		context.next(data)
		return
	}

	context.updateStatus('Phase 1: Downscaling video to 480p for faster processing...')
	const tempDir = settingsManager.getTempDir()
	const lowResPath = await ffmpegAdapter.toLowResolution(videoPath, tempDir, (percent) => {
		context.updateStatus(`Phase 1: Downscaling video... ${percent}%`)
	})

	context.updateStatus('Phase 1: Video downscaled successfully.')
	context.next({ ...data, videoPath: lowResPath })
}

export const convertToAudio: PipelineFunction = async (data, context) => {
	const { videoPath } = data
	context.updateStatus('Phase 1: Converting video to audio...')

	const tempDir = settingsManager.getTempDir()
	const audioPath = await ffmpegAdapter.toAudio(videoPath, tempDir, (percent) => {
		context.updateStatus(`Phase 1: Converting to audio... ${percent}%`)
	})

	context.updateStatus('Phase 1: Audio extracted successfully.')
	context.next({ ...data, audioPath })
}

import { extractTranscriptStructured } from '../../gemini/utils'

export const extractTranscript: PipelineFunction = async (data, context) => {
	const { audioPath } = data

	context.updateStatus('Phase 1: Extracting transcript and time data...')

	const transcript = await extractTranscriptStructured(audioPath)

	console.log('Transcript extracted:', transcript)

	context.updateStatus('Phase 1: Transcript extracted successfully.')
	context.next({ ...data, transcript })
}

export const extractSceneTiming: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 1: Extracting scene timings...')
	await new Promise((resolve) => setTimeout(resolve, 2000))
	context.next(data)
}

export const generateSceneDescription: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 1: Generating scene descriptions...')
	await new Promise((resolve) => setTimeout(resolve, 2000))
	context.next(data)
}
