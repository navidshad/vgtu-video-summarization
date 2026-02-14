import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { GEMINI_MODEL } from '../../constants/gemini'
import { IntentResult } from '../../../shared/types'
import { TranscriptItem, parseSRT, generateSRT } from '../../gemini/utils'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'

const INTENT_PROMPT = `
START OF TRANSCRIPT (keep in mind as reference):
{{transcript}}
END OF TRANSCRIPT

Model Role:
You are an AI assistant for a video summarization tool. Your goal is to understand the user's intent based on their latest message, the conversation history, and the video transcript.

Conversation History:
{{context}}
END OF CONVERSATION HISTORY

Task:
You must decide between two types of actions:
1. "text": Answer the user's question directly with text (e.g., "What is the main topic?", "Who is speaking?").
2. "generate-timeline": signal to other part of the app to generate video.

If the user wants a summary ("generate-timeline"), you must also determine the desired duration in seconds.
- If the user specifies a duration (e.g., "10 seconds"), use that.
- If the user does NOT specify a duration, decide on a reasonable duration based on the video length and complexity (default to 30-60s for medium videos, or up to 5 minutes for very long ones).


The original video is approximately {{videoDuration}} seconds long.


Respond ONLY with a JSON object following this schema:
{
  "type": "text" | "generate-timeline",
  "content": "A brief description of what to do (if generate-timeline) or the final text answer (if text)",
  "duration": number (only if type is "generate-timeline")
}`

const INTENT_SCHEMA = {
	type: 'object',
	properties: {
		type: { type: 'string', enum: ['text', 'generate-timeline'] },
		content: { type: 'string' },
		duration: { type: 'number' }
	},
	required: ['type', 'content']
}

export const determineIntent: PipelineFunction = async (data, context) => {
	context.updateStatus('Phase 2: Analyzing your request...')

	const transcriptPath = context.preprocessing.rawTranscriptPath
	let transcript: TranscriptItem[] = []

	if (transcriptPath && fs.existsSync(transcriptPath)) {
		const content = fs.readFileSync(transcriptPath, 'utf-8')
		transcript = JSON.parse(content)
	}

	// Include timestamps for better context in intent analysis
	const rawSrt = generateSRT(transcript);

	// Get video duration from ffmpeg (source of truth)
	const videoDuration = await ffmpegAdapter.getVideoDuration(context.videoPath)

	const prompt = INTENT_PROMPT
		.replace('{{videoDuration}}', videoDuration.toString())
		.replace('{{context}}', context.context)
		.replace('{{transcript}}', rawSrt)

	try {
		const adapter = GeminiAdapter.create()
		const result = await adapter.generateStructuredText<IntentResult>(
			prompt,
			INTENT_SCHEMA,
			GEMINI_MODEL
		)

		context.intentResult = result

		if (result.type === 'text') {
			context.finish(result.content)
		} else {
			context.updateStatus(`Intent recognized: Generating a ${result.duration}s timeline for: ${result.content}`)
			context.next(data)
		}
	} catch (error) {
		console.error('Error in determineIntent:', error)
		// Fallback to summary if intent analysis fails
		context.intentResult = { type: 'generate-timeline', content: 'Video summary', duration: 30 }
		context.next(data)
	}
}
