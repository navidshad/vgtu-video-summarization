import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { settingsManager } from '../../settings'
import path from 'path'
import fs from 'fs'
import { FileType } from '../../../shared/types'

export const generateOutputImage: PipelineFunction = async (data, context) => {
	context.updateStatus('Generating final image...')

	const gemini = GeminiAdapter.create()
	const modelSettings = settingsManager.getModelSettings()
	const modelName = modelSettings.selection['image-generation']

	const generatorPrompt = context.intentResult?.content || 'Generate a creative image based on the provided ones.'
	const selectedReferenceImages = data.selectedReferenceImages || data.selectedImagePaths || []

	if (selectedReferenceImages.length === 0) {
		throw new Error('No images selected for generation. Please check the intent analysis.')
	}

	try {
		const resultsDir = path.join(context.tempDir, 'results')
		if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true })

		const fileName = `generated_image_${Date.now()}.png`
		const destPath = path.join(resultsDir, fileName)

		const { path: savedPath, record } = await gemini.generateImage(
			modelName,
			generatorPrompt,
			destPath,
			selectedReferenceImages,
			'You are an expert AI image generator. Your ONLY goal is to output a single image that fulfills the user prompt based on the visual context of the provided images. DO NOT output ANY text or explanation—ONLY raw image data.',
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
					...selectedReferenceImages.map((path: string) => ({ url: path, type: FileType.Preview }))
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
