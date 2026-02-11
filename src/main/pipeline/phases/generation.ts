import { PipelineFunction } from '../index'

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 2: Building shorter timeline...')
	await new Promise(resolve => setTimeout(resolve, 3000))
	context.next(data)
}
