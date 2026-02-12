import { PipelineFunction } from '../index'

export const convertToAudio: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 1: Converting video to audio...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.next(data)
}

export const extractTranscript: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 1: Extracting transcript and time data...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.next(data)
}

export const extractSceneTiming: PipelineFunction = async (data, context) => {
	const { videoPath } = data

	context.updateStatus('Phase 1: Extracting scene timings...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.next(data)
}

export const generateSceneDescription: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 1: Generating scene descriptions...')
	await new Promise(resolve => setTimeout(resolve, 2000))
	context.next(data)
}
