import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { threadManager } from '../../threads'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { FileType, MessageRole, EnrichedTimelineSegment } from '../../../shared/types'


export const generateThumbnail: PipelineFunction = async (data, context) => {
	context.updateStatus('Preparing to generate thumbnail...')

	const intent = context.intentResult
	if (!intent || intent.type !== 'generate-thumbnail') {
		return context.next(data)
	}

	// 1.5. Check for previous context if this is an edit/adjustment
	let previousFiles: string[] = []
	let isIteration = false
	if (context.editRefId) {
		const thread = threadManager.getThread(context.threadId)
		let refMsg = thread?.messages.find(m => m.id === context.editRefId)
		
		// If the immediate parent is a User message, the files are in its parent (the previous AI result)
		if (refMsg && refMsg.role === MessageRole.User && refMsg.editRefId) {
			const grandParentId = refMsg.editRefId
			console.log(`[THUMBNAIL] Current ref node ${context.editRefId} is a User message. Jumping to grandparent ${grandParentId}`)
			refMsg = thread?.messages.find(m => m.id === grandParentId)
		}

		if (refMsg && refMsg.files && refMsg.files.length > 0) {
			isIteration = true
			previousFiles = refMsg.files
				.filter(f => f.type === FileType.Actual || f.type === FileType.Preview)
				.map(f => {
					// Normalize: remove media:// and ensure no double slashes or cross-platform issues
					let raw = f.url.replace('media://', '')
					return path.normalize(raw)
				})
			console.log(`[THUMBNAIL] Iteration detected. Found ${previousFiles.length} files from message ${refMsg.id}:`, previousFiles)
		} else {
			console.warn(`[THUMBNAIL] Iteration check: No files found in ref message ${refMsg?.id || context.editRefId}`)
		}
	}

	const modelSettings = (await import('../../settings')).settingsManager.getModelSettings()
	const adapter = GeminiAdapter.create()

	const extractedFrames: string[] = []
	if (!isIteration) {
		// 1. Load Transcripts/Segments for AI analysis
		const transcriptPath = context.preprocessing?.enrichedTranscriptPath || context.preprocessing?.correctedTranscriptPath || context.preprocessing?.transcriptPath || context.preprocessing?.rawTranscriptPath
		let segments: any[] = []
		if (transcriptPath && fs.existsSync(transcriptPath)) {
			try {
				segments = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8')) as EnrichedTimelineSegment[]
			} catch (e) {

				console.warn('Failed to parse transcript for thumbnail scene selection:', e)
			}
		}

		// 2. AI Scene Selection
		context.updateStatus('Selecting visually relevant scenes...')
		const selectionModel = modelSettings.selection['raw-transcript'] // Use Flash for selection
		const selectionPrompt = `
You are a creative director. I want to generate a thumbnail for a video based on this request: "${intent.content}".
Below is a list of segments from the video with their visual/text descriptions.
Select 3-5 specific moments (timestamps) that are most visually interesting or representative of this request.

Video Segments:
${JSON.stringify(segments.slice(0, 100).map(s => ({ start: s.start, end: s.end, description: s.visual || s.text })), null, 2)}


Respond with a JSON object containing a 'selectedScenes' array of objects with 'timestamp' (HH:MM:SS) and 'reason'.
`

		const selectionSchema = {
			type: 'object',
			properties: {
				selectedScenes: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							timestamp: { type: 'string' },
							reason: { type: 'string' }
						},
						required: ['timestamp', 'reason']
					}
				}
			},
			required: ['selectedScenes']
		}

		let selectedTimestamps: number[] = []
		try {
			const { data: selectionResult, record: selectionRecord } = await adapter.generateStructuredText<{ selectedScenes: any[] }>(
				selectionModel,
				selectionPrompt,
				selectionSchema,
				"You are an expert at selecting key frames for video thumbnails.",
				context.signal
			)
			// Record usage immediately
			await context.recordUsage(selectionRecord)
			
			if (context.signal.aborted) return;

			selectedTimestamps = selectionResult.selectedScenes.map(s => timeToSeconds(s.timestamp))
		} catch (e) {
			console.warn('AI Scene selection failed, falling back to default timestamps:', e)
			const videoDuration = await ffmpegAdapter.getVideoDuration(context.videoPath)
			selectedTimestamps = [videoDuration * 0.1, videoDuration * 0.5, videoDuration * 0.9]
		}

	// 3. Extract Chosen Frames
	const validTimestamps = selectedTimestamps.filter(ts => !isNaN(ts) && ts >= 0)
	
	const imagesDir = path.join(context.tempDir, 'generated-images')
	if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

	context.updateStatus(`Extracting ${validTimestamps.length} reference frames...`)
	for (const ts of validTimestamps) {
		try {
			const framePath = await ffmpegAdapter.extractFrame(context.videoPath, ts, imagesDir, context.signal)
			extractedFrames.push(framePath)
		} catch (e) {
			console.warn(`Failed to extract frame at ${ts}:`, e)
		}
	}
}

// 2. Generate the Thumbnail Asset
context.updateStatus('Generating thumbnail image with Gemini...')
const currentModelSettings = (await import('../../settings')).settingsManager.getModelSettings()
const modelName = currentModelSettings.selection['thumbnail']

const resultPath = path.join(context.tempDir, 'generated-images', `thumbnail_${context.messageId}.png`)
context.updateStatus(`Generating thumbnail image with Gemini...`)
	
	const systemInstruction = `You are a professional video thumbnail designer.
Your goal is to create a high-impact, cinematic thumbnail for a video based on a user's request and provided reference frames.

CRITICAL RULES:
1. VISUAL FIDELITY: You must maintain the identity of the people, objects, and locations shown in the reference frames. Do not generate generic characters if specific people are visible in the source images.
2. SOURCE MATERIAL: Treat the provided images as your primary palette. Your output should look like it was created by professionally editing and combining elements from the video, not like a standalone AI image.
3. COMPOSITION: Use principles of good graphic design (Rule of Thirds, leading lines, high contrast) to make the thumbnail "pop".
4. NO HALLUCINATIONS: Do not add major elements unless explicitly requested by the user.

When provided with a "previous result" and "original reference frames":
- PRIORITIZE CONSISTENCY with the previous result unless the user request explicitly asks for a change.
- Refer back to "original reference frames" to ensure you haven't drifted away from the actual video content.`

	let multimodalPrompt = `User Request: "${intent.content}"\n\nPlease generate a thumbnail that fulfills this request using the provided reference frames from the video.`
	if (isIteration) {
		multimodalPrompt = `Refinement Request: "${intent.content}"
		
The provided images include:
1. The PREVIOUS thumbnail result (first image).
2. ORIGINAL reference frames from the video.

Please update the previous result based on the Refinement Request while maintaining strict visual consistency with the original video content.`
	}

	const allReferenceImages = [...previousFiles, ...extractedFrames]
	const { record } = await adapter.generateImage(modelName, multimodalPrompt, resultPath, allReferenceImages, systemInstruction, context.signal)
	
	// Record usage immediately
	await context.recordUsage(record)

	if (context.signal.aborted) return;

	// Determine title/content for the final message
	const messageContent = intent.content

	// Finish pipeline
	// Pass the thumbnail as the main file, and ALL reference images (old and new) in the carousel
	const finalPreviews = Array.from(new Set(allReferenceImages))
		.filter(f => f !== resultPath)
		.map(f => ({ url: f.startsWith('media://') ? f : `media://${f}`, type: FileType.Preview }))

	console.log(`[THUMBNAIL] Finishing stage. Main result: ${resultPath}. Previews: ${finalPreviews.length}`)

	await context.finish(
		messageContent,
		undefined, // Not used when files is provided in options
		undefined, // timeline
		{
			resultType: 'thumbnail',
			files: [
				{ url: resultPath, type: FileType.Actual },
				...finalPreviews
			]
		}
	)
}

function timeToSeconds(t: string | any): number {
	if (typeof t !== 'string') return NaN
	
	// Remove brackets if any [HH:MM:SS]
	const clean = t.replace(/[\[\]]/g, '').trim()
	const parts = clean.split(':').map(val => parseFloat(val))
	
	if (parts.some(p => isNaN(p))) return NaN

	if (parts.length === 3) {
		return parts[0] * 3600 + parts[1] * 60 + parts[2]
	} else if (parts.length === 2) {
		return parts[0] * 60 + parts[1]
	} else if (parts.length === 1) {
		return parts[0]
	}
	return NaN
}
