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

	const intentPrompt = context.intentResult?.content || 'Generate a creative image based on the provided ones.'
	// Standardize all paths (remove media://) and deduplicate
	const rawPaths = data.selectedReferenceImages || data.selectedImagePaths || []
	const allReferenceImages = Array.from(new Set(
		rawPaths.map((p: string) => p.replace(/^media:\/+/i, '/').replace(/\//g, path.sep))
	))

	if (allReferenceImages.length === 0) {
		throw new Error('No images selected for generation. Please check the intent analysis.')
	}

	const generatorPrompt = intentPrompt

	const systemInstruction = `You are an expert AI image generator and editor.
Your ONLY goal is to output a single image that fulfills the user prompt based on the visual context of the provided images.

CRITICAL RULES:
1. VISUAL CONSISTENCY: Maintain consistent appearance for subjects and styles seen in the reference images.
2. OUTPUT: DO NOT output ANY text or explanation—ONLY raw image data.`

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
			context.signal,
			{ includeThinking: !!context.isThinkingMode }
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
