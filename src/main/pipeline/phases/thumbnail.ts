import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { threadManager } from '../../threads'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import path from 'path'
import { FileType, MessageRole, EnrichedTimelineSegment } from '../../../shared/types'
import { THREAD_DIRS } from '../../constants/paths'


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

	const adapter = GeminiAdapter.create()

	// 2. Identify all reference images
	// a. From previous results (if iteration)
	// b. From supply controller (which manages auto-select vs user-attachments)

	const selectedFromSupply = data.selectedReferenceImages || []

	context.updateStatus(`Preparing reference material: ${selectedFromSupply.length} images...`)

	// 2. Generate the Thumbnail Asset
	context.updateStatus('Generating thumbnail image with Gemini...')
	const currentModelSettings = (await import('../../settings')).settingsManager.getModelSettings()
	const modelName = currentModelSettings.selection['thumbnail']

	const resultPath = path.join(context.tempDir, THREAD_DIRS.GENERATED_IMAGES, `thumbnail_${context.messageId}.png`)
	context.updateStatus(`Generating thumbnail image with Gemini...`)

	const systemInstruction = `You are a professional video thumbnail designer.
Your goal is to create a high-impact, cinematic thumbnail for a video based on a user's request and provided reference frames.

CRITICAL RULES:
1. VISUAL CONSISTENCY: Maintain a consistent appearance for the subjects, objects, and locations shown in the reference frames. Avoid generating generic characters if the source images show clear subjects.
2. SOURCE MATERIAL: The provided reference frames are your primary baseline. Your output should look like it was professionally edited from these actual video frames.
3. COMPOSITION: Use principles of good graphic design (Rule of Thirds, leading lines, high contrast) to make the thumbnail "pop".
4. USER CONTEXT: You are editing material provided by the personal user. Focus on creative enhancement rather than autonomous generation.

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

	// Use a maximum of 5 reference images to keep prompt complexity low
	const allReferenceImages = [...previousFiles, ...selectedFromSupply].slice(0, 5)
	const { record, text } = await adapter.generateImage(modelName, multimodalPrompt, resultPath, allReferenceImages, systemInstruction, context.signal, { includeThinking: !!context.isThinkingMode })

	// Record usage immediately
	await context.recordUsage(record)

	if (context.signal.aborted) return;

	// Determine title/content for the final message
	const messageContent = text || intent.content

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
