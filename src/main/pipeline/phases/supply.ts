import { PipelineFunction } from '../index'
import fs from 'fs'

export const supplyController: PipelineFunction = async (data, context) => {
	context.updateStatus('Managing reference images...')

	// Case 1: User provided attachments
	// Rule: If user provide frames, then none for auto select.
	if (context.attachedImages && context.attachedImages.length > 0) {
		console.log(`[SUPPLY] User provided ${context.attachedImages.length} attachments. Skipping auto-selection from video.`)
		const cleanedPaths = context.attachedImages.map(url => url.replace(/^media:\/+/i, '/'))
		context.next({ ...data, selectedReferenceImages: cleanedPaths })
		return
	}

	// Case 2: No attachments, handle auto-selection from video frames or source images
	const referenceFrames = context.preprocessing?.['reference-frames'] || []
	const sourceImages = context.preprocessing?.['sourceImages'] || []
	const isImageThread = context.preprocessing?.['imageTextPath'] !== undefined
	
	const intentResult = context.intentResult

	if (!referenceFrames.length && !sourceImages.length) {
		console.log('[SUPPLY] No reference material available in project.')
		context.next({ ...data, selectedReferenceImages: [] })
		return
	}

	// Rule: if user wont provide frames, ai must select a few frames itself.
	const selectedIndices = intentResult?.selectedIndices || []
	
	if (selectedIndices.length > 0) {
		console.log(`[SUPPLY] AI selected ${selectedIndices.length} items for reference.`)
		
		if (isImageThread) {
			const allImagesPool = [...sourceImages, ...referenceFrames]
			const selectedPaths = selectedIndices
				.map(idx => allImagesPool[idx])
				.filter(p => p && fs.existsSync(p))
			console.log(`[SUPPLY] Resolved ${selectedPaths.length} images from pool of ${allImagesPool.length}.`)
			context.next({ ...data, selectedReferenceImages: selectedPaths })
			return
		}

		// Map indices to video frames
		const sceneDescriptionPath = context.preprocessing.sceneDescriptionsPath
		if (sceneDescriptionPath && fs.existsSync(sceneDescriptionPath)) {
			const scenes: any[] = JSON.parse(fs.readFileSync(sceneDescriptionPath, 'utf-8'));
			const selectedFramePaths: string[] = []

			for (const idx of selectedIndices) {
				const scene = scenes.find(s => s.index === idx)
				const frame = scene?.framePath
				if (frame && fs.existsSync(frame)) {
					selectedFramePaths.push(frame)
				}
			}

			console.log(`[SUPPLY] Resolved ${selectedFramePaths.length} video frames from indices.`)
			context.next({ ...data, selectedReferenceImages: selectedFramePaths })
			return
		}
	}

	// Fallback Case: No attachments and no indices (or missing metadata)
	// Pick some representative frames/images
	const pool = isImageThread ? [...sourceImages, ...referenceFrames] : referenceFrames
	console.log(`[SUPPLY] No specific selection. Picking representative items from pool of ${pool.length}.`)
	const fallbackIndices = pool.length <= 5 
		? pool.map((_, i) => i)
		: [0, Math.floor(pool.length / 2), pool.length - 1]
	
	const fallbackPaths = fallbackIndices
		.map(i => pool[i])
		.filter(p => p && fs.existsSync(p))

	context.next({ ...data, selectedReferenceImages: fallbackPaths })
}
