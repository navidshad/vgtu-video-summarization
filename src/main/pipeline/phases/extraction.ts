import { PipelineFunction } from '../index'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { extractTranscript, generateSRT } from '../../gemini/utils'
import { SceneDetector } from '../../scenedetect'
import { GeminiAdapter } from '../../gemini/adapter'
import { Scene } from '../../scenedetect/types'
import { GEMINI_MODEL_2_5_FLASH_LITE } from '../../constants/gemini'

const SCENE_DESCRIPTION_PROMPT = `Describe the visual action, setting, and atmosphere of this image in one concise sentence. Focus on what is happening.`

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

	const { items: transcript, record } = await extractTranscript(audioPath, duration)
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

	const { items: transcript, record } = await extractTranscript(audioPath, duration, rawSrt)
	context.recordUsage(record)

	const tempDir = context.tempDir
	const correctedTranscriptPath = path.join(tempDir, `corrected_transcript.json`)
	fs.writeFileSync(correctedTranscriptPath, JSON.stringify(transcript, null, 2))

	context.savePreprocessing({ correctedTranscriptPath, transcriptPath: correctedTranscriptPath })
	context.updateStatus('Transcript refined.')
	context.next({ ...data, transcript })
}

export const extractSceneTiming: PipelineFunction = async (data, context) => {
	const videoPath = context.preprocessing.lowResVideoPath || context.videoPath
	context.updateStatus('Detecting scenes in video...')

	const detector = new SceneDetector()
	let scenes: Scene[] = []
	try {
		scenes = await detector.detectScenes(videoPath)
	} catch (error) {
		console.error('Scene detection failed:', error)
		context.updateStatus('Scene detection failed, proceeding without scenes.')
		// fallback to empty scenes or default?
		// for now, we just don't save sceneTimesPath
		context.next(data)
		return
	}

	const tempDir = context.tempDir
	const sceneTimesPath = path.join(tempDir, `scenes.json`)
	fs.writeFileSync(sceneTimesPath, JSON.stringify(scenes, null, 2))

	context.savePreprocessing({ sceneTimesPath })
	context.updateStatus(`Detected ${scenes.length} scenes.`)
	context.next({ ...data, scenes })
}

export const generateSceneDescription: PipelineFunction = async (data, context) => {
	const sceneTimesPath = context.preprocessing.sceneTimesPath
	if (!sceneTimesPath) {
		context.next(data)
		return
	}

	const scenes: Scene[] = JSON.parse(fs.readFileSync(sceneTimesPath, 'utf-8'))
	const videoPath = context.preprocessing.lowResVideoPath || context.videoPath
	const tempDir = context.tempDir

	context.updateStatus(`Generating descriptions for ${scenes.length} scenes...`)

	const gemini = GeminiAdapter.create()
	// Use a cheap model for description
	const modelName = GEMINI_MODEL_2_5_FLASH_LITE

	const descriptions: { index: number, startTime: number, description: string }[] = []
	const framesDir = path.join(tempDir, 'frames')
	if (!fs.existsSync(framesDir)) {
		fs.mkdirSync(framesDir)
	}

	// Process in batches to avoid overwhelming (though sequential is safer for FFmpeg)
	for (let i = 0; i < scenes.length; i++) {
		const scene = scenes[i]
		const midpoint = scene.startTime + (scene.duration / 2)

		// Skip very short scenes?
		if (scene.duration < 1.0) continue;

		try {
			context.updateStatus(`analyzing scene ${i + 1}/${scenes.length}...`)

			// 1. Extract Frame
			const framePath = await ffmpegAdapter.extractFrame(videoPath, midpoint, framesDir)

			// 2. Upload Frame
			const frameUri = await gemini.uploadFile(framePath, 'image/jpeg')

			// 3. Describe Frame
			const { text, record } = await gemini.generateDescriptionFromImage(
				modelName,
				SCENE_DESCRIPTION_PROMPT,
				frameUri
			)
			context.recordUsage(record)

			descriptions.push({
				index: i,
				startTime: scene.startTime,
				description: text.trim()
			})

			// Cleanup frame to save space
			fs.unlinkSync(framePath)

		} catch (error) {
			console.error(`Failed to describe scene ${i}:`, error)
		}
	}

	const sceneDescriptionsPath = path.join(tempDir, `scene_descriptions.json`)
	fs.writeFileSync(sceneDescriptionsPath, JSON.stringify(descriptions, null, 2))

	context.savePreprocessing({ sceneDescriptionsPath })
	context.updateStatus('Scene descriptions generated.')
	context.next({ ...data, sceneDescriptions: descriptions })
}
