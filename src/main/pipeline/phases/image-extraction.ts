import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import fs from 'fs'
import path from 'path'
import { settingsManager } from '../../settings'
import { THREAD_DIRS } from '../../constants/paths'

export const extractImageData: PipelineFunction = async (_data, context) => {
	const sourceImages = context.preprocessing.sourceImages || []
	const referenceFrames = context.preprocessing['reference-frames'] || []
	const allImages = [...sourceImages, ...referenceFrames]

	if (allImages.length === 0) {
		context.next(_data)
		return
	}

	context.updateStatus(`Extracting data from ${allImages.length} images...`)

	const gemini = GeminiAdapter.create()
	const modelSettings = settingsManager.getModelSettings()
	const modelName = modelSettings.selection['image-extraction']

	const BATCH_SIZE = 15 // Smaller batch for detailed extraction
	const imageTexts: Record<string, string> = {}

	for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
		const batch = allImages.slice(i, i + BATCH_SIZE)
		context.updateStatus(`Analyzing images ${i + 1} to ${Math.min(i + BATCH_SIZE, allImages.length)} / ${allImages.length}...`)

		try {
			const uploadPromises = batch.map(fpath => gemini.uploadFile(fpath, 'image/jpeg'))
			const uris = await Promise.all(uploadPromises)

			const prompt = `For EACH of these ${batch.length} images (referenced by their order 0 to ${batch.length - 1}), provide a detailed textual description. 
Include any visible text (OCR), key objects, people, setting, and atmosphere. 
Be precise as this text will be used by an AI to decide which images to use for a creative task.
Return the results as a JSON object with a 'data' array of objects, each containing 'index' (number) and 'description' (string).`

			const schema = {
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								index: { type: 'number' },
								description: { type: 'string' }
							},
							required: ['index', 'description']
						}
					}
				},
				required: ['data']
			}

			const { data: result, record } = await gemini.generateStructuredFromImages<{ data: Array<{ index: number, description: string }> }>(
				modelName,
				prompt,
				uris,
				schema,
				context.signal
			)

			await context.recordUsage(record)

			if (context.signal.aborted) return

			result.data.forEach((item) => {
				const realIndex = i + item.index
				if (allImages[realIndex]) {
					imageTexts[allImages[realIndex]] = item.description
				}
			})

		} catch (error) {
			if (!context.signal.aborted) {
				console.error(`Failed to extract data for batch ${i}:`, error)
			}
		}
	}

	const analysisDir = path.join(context.tempDir, THREAD_DIRS.ANALYSIS)
	if (!fs.existsSync(analysisDir)) fs.mkdirSync(analysisDir, { recursive: true })

	const imageTextPath = path.join(analysisDir, 'image_data.json')
	fs.writeFileSync(imageTextPath, JSON.stringify(imageTexts, null, 2))

	await context.savePreprocessing({ imageTextPath })
	context.updateStatus('Image data extraction complete.')
	context.next({ ..._data, imageTexts })
}
