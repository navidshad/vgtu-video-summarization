import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { settingsManager } from '../../settings'
import { threadManager } from '../../threads'
import path from 'path'
import fs from 'fs'
import { FileType, MessageRole } from '../../../shared/types'
import { THREAD_DIRS } from '../../constants/paths'

export const generateOutputImage: PipelineFunction = async (data, context) => {
	context.updateStatus('Generating final image...')

	const gemini = GeminiAdapter.create()
	const modelSettings = settingsManager.getModelSettings()
	const modelName = modelSettings.selection['image-generation']

	// 1. Detect iteration/refinement
	let previousFiles: string[] = []
	let isIteration = false
	if (context.editRefId) {
		const thread = threadManager.getThread(context.threadId)
		let refMsg = thread?.messages.find(m => m.id === context.editRefId)

		// If the immediate parent is a User message, the files are in its parent (the previous AI result)
		if (refMsg && refMsg.role === MessageRole.User && refMsg.editRefId) {
			const grandParentId = refMsg.editRefId
			refMsg = thread?.messages.find(m => m.id === grandParentId)
		}

		if (refMsg && refMsg.files && refMsg.files.length > 0) {
			isIteration = true
			previousFiles = refMsg.files
				.filter(f => f.type === FileType.Actual || f.type === FileType.Preview)
				.map(f => {
					let raw = f.url.replace('media://', '')
					return path.normalize(raw)
				})
			console.log(`[IMAGE-GEN] Iteration detected. Found ${previousFiles.length} files from message ${refMsg.id}`)
		}
	}

	const intentPrompt = context.intentResult?.content || 'Generate a creative image based on the provided ones.'
	const selectedReferenceImages = data.selectedReferenceImages || data.selectedImagePaths || []

	if (selectedReferenceImages.length === 0 && previousFiles.length === 0) {
		throw new Error('No images selected for generation. Please check the intent analysis.')
	}

	// 2. Combine reference images, prioritizing previous results if iterating
	// Use a max of 5 images to keep prompt complexity manageable
	const allReferenceImages = Array.from(new Set([...previousFiles, ...selectedReferenceImages])).slice(0, 5)

	const generatorPrompt = isIteration 
		? `Refinement Request: "${intentPrompt}"\n\nPlease update the previous result based on this request while maintaining visual consistency with the original source images.`
		: intentPrompt

	const systemInstruction = `You are an expert AI image generator and editor.
Your ONLY goal is to output a single image that fulfills the user prompt based on the visual context of the provided images.

CRITICAL RULES:
1. VISUAL CONSISTENCY: Maintain consistent appearance for subjects and styles seen in the reference images.
2. REFINEMENT: If a previous result is provided (usually the first image), treat this as an "edit" or "refinement" task. Focus on applying the requested changes while keeping the overall composition and subjects consistent with the previous image.
3. OUTPUT: DO NOT output ANY text or explanation—ONLY raw image data.`

	try {
		const resultsDir = path.join(context.tempDir, THREAD_DIRS.GENERATED_IMAGES)
		if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true })

		const fileName = `generated_image_${Date.now()}.png`
		const destPath = path.join(resultsDir, fileName)

		const { path: savedPath, record } = await gemini.generateImage(
			modelName,
			generatorPrompt,
			destPath,
			allReferenceImages,
			systemInstruction,
			context.signal
		)

		await context.recordUsage(record)

		if (context.signal.aborted) return

		context.updateStatus('Generation complete.')
		context.finish(
			`I have generated a new image based on your request: ${generatorPrompt.substring(0, 50)}...`,
			undefined,
			undefined,
			{
				resultType: 'image',
				files: [
					{ url: savedPath, type: FileType.Actual },
					...allReferenceImages.filter(p => p !== savedPath).map((path: string) => ({ 
						url: path.startsWith('media://') ? path : `media://${path}`, 
						type: FileType.Preview 
					}))
				]
			}
		)

	} catch (error) {
		if (!context.signal.aborted) {
			console.error(`Failed to generate output image:`, error)
		}
		throw error
	}
}
