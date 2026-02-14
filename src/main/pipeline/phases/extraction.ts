import { PipelineFunction } from '../index'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { extractRawTranscript as extractRawFromGemini, correctTranscript as correctFromGemini, generateSRT } from '../../gemini/utils'

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
	const videoPath = context.preprocessing.lowResVideoPath! || context.videoPath;
	context.updateStatus('Phase 1: Converting video to audio...')

	const tempDir = context.tempDir
	const audioPath = await ffmpegAdapter.toAudio(videoPath, tempDir, (percent) => {
		context.updateStatus(`Phase 1: Converting to audio... ${percent}%`)
	})

	context.savePreprocessing({ audioPath })
	context.updateStatus('Phase 1: Audio extracted successfully.')
	context.next({ ...data, audioPath })
}


export const extractRawTranscript: PipelineFunction = async (data, context) => {
	const audioPath = data.audioPath || context.preprocessing.audioPath
	if (!audioPath) {
		throw new Error('Audio path not found for transcript extraction')
	}

	context.updateStatus('Phase 1: Extracting raw transcript...')

	const transcript = await extractRawFromGemini(audioPath)
	const srtContent = generateSRT(transcript)

	const tempDir = context.tempDir
	const rawSrtPath = path.join(tempDir, `raw_transcript.srt`)
	fs.writeFileSync(rawSrtPath, srtContent)

	context.savePreprocessing({ rawSrtPath, srtPath: rawSrtPath }) // Backward compatibility
	context.updateStatus('Phase 1: Raw transcript extracted.')
	context.next({ ...data, transcript })
}

export const extractCorrectedTranscript: PipelineFunction = async (data, context) => {
	const audioPath = context.preprocessing.audioPath
	const rawSrtPath = context.preprocessing.rawSrtPath

	if (!audioPath || !rawSrtPath) {
		context.next(data)
		return
	}

	context.updateStatus('Phase 1: Correcting transcript for better accuracy...')

	const rawSrt = fs.readFileSync(rawSrtPath, 'utf-8')
	const transcript = await correctFromGemini(audioPath, rawSrt)
	const srtContent = generateSRT(transcript)

	const tempDir = context.tempDir
	const correctedSrtPath = path.join(tempDir, `corrected_transcript.srt`)
	fs.writeFileSync(correctedSrtPath, srtContent)

	context.savePreprocessing({ correctedSrtPath, srtPath: correctedSrtPath })
	context.updateStatus('Phase 1: Transcript refined.')
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
