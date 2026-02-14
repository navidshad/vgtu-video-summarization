import { PipelineFunction } from '../index'
import { GeminiAdapter } from '../../gemini/adapter'
import { GEMINI_MODEL } from '../../constants/gemini'
import { IntentResult } from '../../../shared/types'
import { TranscriptItem, generateSRT } from '../../gemini/utils'
import * as ffmpegAdapter from '../../ffmpeg'
import fs from 'fs'

const INTENT_SYSTEM_INSTRUCTION = `
Model Role:
You are an AI assistant for a video summarization tool. Your goal is to understand the user's intent based on their latest message, the conversation history, and the video transcript.

Task:
You must decide between two types of actions:
1. "text": Conversational response. Use this for general questions, proposing a summary plan, or asking for final confirmation. This is the DEFAULT and preferred action.
2. "generate-timeline": Signal to actually build the video.

Confirmation Rules (STRICT ENFORCEMENT):
- NEVER trigger "generate-timeline" for suggestive or planning phrases like "let's make a summary", "can you create a highlights clip", "how about a summary", or "I want to see the key moments", etc.
- For any of the above, use "text" to describe what you will include in the summary (e.g. "I will create a 30s summary focusing on [X].") and ask: "Shall I proceed with generating this video?".
- ONLY trigger "generate-timeline" if:
    a) The user gives a direct, unambiguous COMMAND including a duration (e.g., "Generate/Create a 30s video now").
    b) The user explicitly confirms a proposal you just made (e.g., "Yes", "Go ahead", "Do it", "Proceed").
- If the user asks "Tell me about the video", provide a detailed text description in the chat and do NOT trigger generation.

Behavioral Guidelines:
- If "generate-timeline" is triggered, you must determine the desired duration in seconds.
  - If specified, use that.
  - If NOT specified, use a reasonable duration based on video length (default 30-60s).

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

	const userPrompt = `
The original video is approximately ${videoDuration} seconds long.

START OF TRANSCRIPT (keep in mind as reference):
${rawSrt}
END OF TRANSCRIPT

Conversation History:
${context.context}
END OF CONVERSATION HISTORY
`

	try {
		const adapter = GeminiAdapter.create()
		const result = await adapter.generateStructuredText<IntentResult>(
			userPrompt,
			INTENT_SCHEMA,
			INTENT_SYSTEM_INSTRUCTION,
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
