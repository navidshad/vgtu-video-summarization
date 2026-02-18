import { PipelineFunction } from '../index'
import { generateTimeline } from '../../timeline'
import { enrichTranscriptWithScenes, SceneDescription } from '../../timeline/enrichment'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'
import { TranscriptItem } from 'src/main/gemini/utils'

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
  context.updateStatus('Preparing for timeline generation...')

  const transcriptPath = context.preprocessing?.correctedTranscriptPath || context.preprocessing?.transcriptPath || context.preprocessing?.rawTranscriptPath
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    throw new Error('Transcript file not found. Cannot generate timeline.')
  }

  const transcriptJson = fs.readFileSync(transcriptPath, 'utf-8')
  let transcript = JSON.parse(transcriptJson) as TranscriptItem[]

  // Enrich with scenes if available
  if (context.preprocessing.sceneDescriptionsPath && fs.existsSync(context.preprocessing.sceneDescriptionsPath)) {
    try {
      const scenesJson = fs.readFileSync(context.preprocessing.sceneDescriptionsPath, 'utf-8')
      const sceneDescriptions: SceneDescription[] = JSON.parse(scenesJson)

      // We need total duration to close the last gap
      // Ideally we get it from context or ffmpeg, but for now we can infer or use a large number
      // Actually we can get it from ffmpegAdapter if we want, or just rely on the last timestamp of transcript
      // Let's try to get it from metadata if possible, or just use the last transcript end time + gap
      const videoDuration = await ffmpegAdapter.getVideoDuration(context.preprocessing.audioPath!)

      transcript = enrichTranscriptWithScenes(transcript, sceneDescriptions, videoDuration)
      context.updateStatus(`Enriched transcript with visual scene data.`)
    } catch (e) {
      console.warn("Failed to enrich transcript:", e)
    }
  }

  const userExpectation = context.intentResult?.content || context.context || "Create a highlight reel."
  const targetDuration = context.intentResult?.duration || 30 // Default 30 seconds
  const baseTimeline = context.baseTimeline || []

  // Decide mode and model
  const mode = baseTimeline.length > 0 ? 'edit' : 'new'
  const modelSettings = (await import('../../settings')).settingsManager.getModelSettings()
  const modelName = mode === 'edit' ? modelSettings.selection['timeline-edit'] : modelSettings.selection['timeline-new']

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
