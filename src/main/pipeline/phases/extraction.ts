import { PipelineFunction } from '../index'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { extractRawTranscript as extractRawFromGemini, correctTranscript as correctFromGemini, generateSRT } from '../../gemini/utils'

export const ensureLowResolution: PipelineFunction = async (_data, context) => {
	const videoPath = context.videoPath
	context.updateStatus('Checking video resolution...')

	const isLowRes = await ffmpegAdapter.isVideoLowResolution(videoPath)
	if (isLowRes) {
		context.updateStatus('Video is already low resolution.')
		context.next({ videoPath })
		return
	}

	context.updateStatus('Downscaling video to 480p for faster processing...')
	const tempDir = context.tempDir
	const lowResPath = await ffmpegAdapter.toLowResolution(videoPath, tempDir, (percent) => {
		context.updateStatus(`Downscaling video... ${percent}%`)
	})

	context.savePreprocessing({ lowResVideoPath: lowResPath })
	context.updateStatus('Video downscaled successfully.')
	context.next({ videoPath: lowResPath })
}

export const convertToAudio: PipelineFunction = async (data, context) => {
	const videoPath = context.preprocessing.lowResVideoPath! || context.videoPath;
	context.updateStatus('Converting video to audio...')

	const tempDir = context.tempDir
	const audioPath = await ffmpegAdapter.toAudio(videoPath, tempDir, (percent) => {
		context.updateStatus(`Converting to audio... ${percent}%`)
	})

	context.savePreprocessing({ audioPath })
	context.updateStatus('Audio extracted successfully.')
	context.next({ ...data, audioPath })
}


export const extractRawTranscript: PipelineFunction = async (data, context) => {
	const audioPath = data.audioPath || context.preprocessing.audioPath
	if (!audioPath) {
		throw new Error('Audio path not found for transcript extraction')
	}

	context.updateStatus('Extracting raw transcript...')
	const duration = await ffmpegAdapter.getVideoDuration(audioPath)

	const { items: transcript, record } = await extractRawFromGemini(audioPath, duration)
	context.recordUsage(record)

	const tempDir = context.tempDir
	const rawTranscriptPath = path.join(tempDir, `raw_transcript.json`)
	fs.writeFileSync(rawTranscriptPath, JSON.stringify(transcript, null, 2))

	context.savePreprocessing({ rawTranscriptPath, transcriptPath: rawTranscriptPath })
	context.updateStatus('Raw transcript extracted.')
	context.next({ ...data, transcript })
}

export const extractCorrectedTranscript: PipelineFunction = async (data, context) => {
	const audioPath = context.preprocessing.audioPath
	const rawTranscriptPath = context.preprocessing.rawTranscriptPath

	if (!audioPath || !rawTranscriptPath) {
		context.next(data)
		return
	}

	context.updateStatus('Correcting transcript for better accuracy...')
	const duration = await ffmpegAdapter.getVideoDuration(audioPath)

	const transcriptJson = fs.readFileSync(rawTranscriptPath, 'utf-8')
	const rawTranscript = JSON.parse(transcriptJson)
	const rawSrt = generateSRT(rawTranscript)

	const { items: transcript, record } = await correctFromGemini(audioPath, rawSrt, duration)
	context.recordUsage(record)

	const tempDir = context.tempDir
	const correctedTranscriptPath = path.join(tempDir, `corrected_transcript.json`)
	fs.writeFileSync(correctedTranscriptPath, JSON.stringify(transcript, null, 2))

	context.savePreprocessing({ correctedTranscriptPath, transcriptPath: correctedTranscriptPath })
	context.updateStatus('Transcript refined.')
	context.next({ ...data, transcript })
}

export const extractSceneTiming: PipelineFunction = async (data, context) => {
	context.updateStatus('Extracting scene timings...')
	await new Promise((resolve) => setTimeout(resolve, 2000))
	context.next(data)
}

export const generateSceneDescription: PipelineFunction = async (data, context) => {
	context.updateStatus('Generating scene descriptions...')
	await new Promise((resolve) => setTimeout(resolve, 2000))
	context.next(data)
}
