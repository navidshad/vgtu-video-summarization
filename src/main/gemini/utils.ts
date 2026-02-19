import { GeminiAdapter } from './adapter'
import { settingsManager } from '../settings'
import { UsageRecord } from '../../shared/types'

export interface TranscriptItem {
	start: string
	end: string
	text: string
}

const TRANSCRIPT_PROMPT = `Extract a detailed transcript from the provided audio in SRT (Subtitle) format.

Each entry must strictly follow this format:
"""str
1
00:00:01,000 --> 00:00:05,000
Text content here.
<empty line>
2
00:00:05,000 --> 00:00:10,000
[Music playing]
"""

Rules:
- Use HH:MM:SS,mmm format for timestamps.
- Respond ONLY with the SRT content. 
- Do not include any preamble, conversational text, or markdown code blocks.
- **IMPORTANT**: Transcribe significant audio events (e.g., [Music], [Applause], [Laughter], [Silence]) in brackets.`

const TRANSCRIPT_CORRECTION_PROMPT = `You are an expert transcriber. I am providing you with an audio file and an initial transcript (in SRT format) that was generated for it. 
Your task is to review the transcript against the audio and correct any errors (mishearings, missing words, incorrect timestamps).

Rules:
1. Respond ONLY with the FULL corrected transcript in SRT format. 
2. Do not include any preamble, conversational text, or markdown code blocks.
3. **CRITICAL**: Preserve all audio event markers (e.g., [Music], [Applause]) unless they are clearly incorrect.`

/**
 * Normalizes a timestamp string to HH:MM:SS,mmm format.
 */
function normalizeTimestamp(t: string): string {
	const clean = t.trim().replace('.', ',')
	const [timePart, milliPart = '000'] = clean.split(',')

	const parts = timePart.split(':').map(Number)
	let hh = 0, mm = 0, ss = 0

	if (parts.length === 3) {
		[hh, mm, ss] = parts
	} else if (parts.length === 2) {
		[mm, ss] = parts
	} else if (parts.length === 1) {
		ss = parts[0]
	}

	const pad = (n: number, z = 2) => n.toString().padStart(z, '0')
	const ms = milliPart.padEnd(3, '0').substring(0, 3)

	return `${pad(hh)}:${pad(mm)}:${pad(ss)},${ms}`
}

/**
 * Parses SRT text into TranscriptItem array.
 */
export function parseSRT(srt: string): TranscriptItem[] {
	const items: TranscriptItem[] = []
	let cleanSrt = srt.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()
	const allLines = cleanSrt.split(/\r?\n/).map(l => l.trim())
	const timestampRegex = /((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)/

	for (let i = 0; i < allLines.length; i++) {
		const line = allLines[i]
		if (/^\d+$/.test(line)) {
			const nextLine = allLines[i + 1]
			if (nextLine && timestampRegex.test(nextLine)) {
				const timeMatch = nextLine.match(timestampRegex)!
				const start = normalizeTimestamp(timeMatch[1])
				const end = normalizeTimestamp(timeMatch[2])

				let textLines: string[] = []
				let j = i + 2
				while (j < allLines.length) {
					const cur = allLines[j]
					const ahead = allLines[j + 1]
					if (/^\d+$/.test(cur) && ahead && timestampRegex.test(ahead)) {
						break
					}
					if (cur !== '' && cur !== '\t') {
						textLines.push(cur)
					}
					j++
				}
				items.push({ start, end, text: textLines.join(' ') })
				i = j - 1
			}
		}
	}
	return items
}

/**
 * Generates standard SRT text from TranscriptItem array.
 */
export function generateSRT(items: TranscriptItem[]): string {
	return items.map((item, index) => {
		const start = normalizeTimestamp(item.start)
		const end = normalizeTimestamp(item.end)
		return `${index + 1}\n${start} --> ${end}\n${item.text}\n`
	}).join('\n')
}

/**
 * Extracts or corrects a transcript from an audio file using Gemini.
 */
export async function extractTranscript(
	audioPath: string,
	audioDuration: number = 0,
	rawSrt?: string
): Promise<{ items: TranscriptItem[], record: UsageRecord }> {
	const adapter = GeminiAdapter.create()
	const modelSettings = settingsManager.getModelSettings()

	const modelName = rawSrt
		? modelSettings.selection['corrected-transcript']
		: modelSettings.selection['raw-transcript']

	const fileUri = await adapter.uploadFile(audioPath, 'audio/mpeg')

	const userPrompt = rawSrt
		? `Initial Transcript:\n${rawSrt}`
		: 'Generate the SRT for this audio.'

	const systemInstruction = rawSrt
		? TRANSCRIPT_CORRECTION_PROMPT
		: TRANSCRIPT_PROMPT

	const { text, record } = await adapter.generateTextFromFiles(
		modelName,
		userPrompt,
		[fileUri],
		systemInstruction,
		audioDuration
	)

	return {
		items: parseSRT(text),
		record
	}
}
