import { PipelineFunction } from '../index'
import { generateTimeline } from '../../timeline'
import fs from 'fs'

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
  context.updateStatus('Preparing for timeline generation...')

  const transcriptPath = context.preprocessing?.correctedTranscriptPath || context.preprocessing?.transcriptPath || context.preprocessing?.rawTranscriptPath
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    throw new Error('Transcript file not found. Cannot generate timeline.')
  }

  const transcriptJson = fs.readFileSync(transcriptPath, 'utf-8')
  const transcript = JSON.parse(transcriptJson)
  const userExpectation = context.intentResult?.content || context.context || "Create a highlight reel."
  const targetDuration = context.intentResult?.duration || 30 // Default 30 seconds
  const baseTimeline = context.baseTimeline || []

  // Decide mode and model
  const mode = baseTimeline.length > 0 ? 'edit' : 'new'
  const { GEMINI_MODEL, GEMINI_MODEL_FLASH_THINKING } = await import('../../constants/gemini')
  const modelName = mode === 'edit' ? GEMINI_MODEL : GEMINI_MODEL_FLASH_THINKING

  try {
    const shorterTimeline = await generateTimeline({
      userExpectation,
      allSegments: transcript,
      targetDuration,
      baseTimeline,
      modelName,
      mode,
      onUpdateStatus: (status) => context.updateStatus(status),
      onRecordUsage: (record) => context.recordUsage(record)
    })

    if (shorterTimeline.length === 0) {
      context.finish('Failed to generate timeline.', undefined, [])
      return;
    }

    // Finish Pipeline with the generated timeline
    context.updateStatus('Processing complete. Short timeline generated.')

    // Ready for the assembly phase (pass timeline in data)
    context.next({ ...data, timeline: shorterTimeline })

  } catch (error) {
    console.error('Error in buildShorterTimeline:', error)
    // We should probably rely on pipeline error handling, but here we can add context
    throw error
  }
}
