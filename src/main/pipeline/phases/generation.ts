import { PipelineFunction } from '../index'

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
	if (context.baseTimeline) {
		context.updateStatus('Phase 2: Refining timeline based on previous context...')
	} else {
		context.updateStatus('Phase 2: Building shorter timeline...')
	}

	await new Promise(resolve => setTimeout(resolve, 3000))
	context.next(data)
}
