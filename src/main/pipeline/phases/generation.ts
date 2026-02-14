import { PipelineFunction } from '../index'
import { generateTimeline } from '../../timeline'
import { GeminiAdapter } from '../../gemini/adapter'
import fs from 'fs'

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
  context.updateStatus('Phase 2: Preparing for timeline generation...')

  const srtPath = context.preprocessing?.correctedSrtPath || context.preprocessing?.srtPath || context.preprocessing?.rawSrtPath
  if (!srtPath || !fs.existsSync(srtPath)) {
    throw new Error('SRT file not found. Cannot generate timeline.')
  }

  const fullTimelineSRT = fs.readFileSync(srtPath, 'utf-8')
  const userExpectation = context.intentResult?.content || context.context || "Create a highlight reel."
  const targetDuration = context.intentResult?.duration || 30 // Default 30 seconds
  const baseTimeline = context.baseTimeline || []

  try {
    const geminiAdapter = GeminiAdapter.create()

    // Wrapper for status updates
    const updateStatus = (status: string) => {
      context.updateStatus(status)
    }

    const shorterTimeline = await generateTimeline(
      userExpectation,
      fullTimelineSRT,
      targetDuration,
      geminiAdapter,
      updateStatus,
      baseTimeline
    )

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
