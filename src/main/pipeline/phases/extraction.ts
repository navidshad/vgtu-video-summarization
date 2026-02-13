import { PipelineFunction } from '../index'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'

export const ensureLowResolution: PipelineFunction = async (_data, context) => {
	const videoPath = context.videoPath
	context.updateStatus('Phase 1: Checking video resolution...')

	const isLowRes = await ffmpegAdapter.isVideoLowResolution(videoPath)
	if (isLowRes) {
		context.updateStatus('Phase 1: Video is already low resolution.')
		context.next({ videoPath })
		return
	}

	context.updateStatus('Phase 1: Downscaling video to 480p for faster processing...')
	const tempDir = context.tempDir
	const lowResPath = await ffmpegAdapter.toLowResolution(videoPath, tempDir, (percent) => {
		context.updateStatus(`Phase 1: Downscaling video... ${percent}%`)
	})

	context.savePreprocessing({ lowResVideoPath: lowResPath })
	context.updateStatus('Phase 1: Video downscaled successfully.')
	context.next({ videoPath: lowResPath })
}

export const convertToAudio: PipelineFunction = async (data, context) => {
	const videoPath = data.videoPath || context.videoPath
	context.updateStatus('Phase 1: Converting video to audio...')

	const tempDir = context.tempDir
	const audioPath = await ffmpegAdapter.toAudio(videoPath, tempDir, (percent) => {
		context.updateStatus(`Phase 1: Converting to audio... ${percent}%`)
	})

	context.savePreprocessing({ audioPath })
	context.updateStatus('Phase 1: Audio extracted successfully.')
	context.next({ ...data, audioPath })
}

import { extractTranscriptStructured, generateSRT } from '../../gemini/utils'

export const extractTranscript: PipelineFunction = async (data, context) => {
	const audioPath = data.audioPath || context.preprocessing.audioPath
	if (!audioPath) {
		throw new Error('Audio path not found for transcript extraction')
	}

	context.updateStatus('Phase 1: Extracting transcript and time data...')

	const transcript = await extractTranscriptStructured(audioPath)
	const srtContent = generateSRT(transcript)

	const tempDir = context.tempDir
	const srtPath = path.join(tempDir, `transcript.srt`)
	fs.writeFileSync(srtPath, srtContent)

	context.savePreprocessing({ srtPath })
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
