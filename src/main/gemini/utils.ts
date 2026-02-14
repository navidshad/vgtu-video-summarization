import { GeminiAdapter } from './adapter'

export interface TranscriptItem {
	start: string
	end: string
	text: string
}

const TRANSCRIPT_PROMPT = `Extract a detailed transcript from the provided audio in SRT (Subtitle) format.

Each entry must strictly follow this format:
1
00:00:01,000 --> 00:00:05,000
Text content here.

2
00:00:05,000 --> 00:00:10,000
Next segment text.

Rules:
- Use HH:MM:SS,mmm format for timestamps.
- Respond ONLY with the SRT content. 
- Do not include any preamble, conversational text, or markdown code blocks.`

const TRANSCRIPT_CORRECTION_PROMPT = `You are an expert transcriber. I am providing you with an audio file and an initial transcript (in SRT format) that was generated for it. 
Your task is to review the transcript against the audio and correct any errors (mishearings, missing words, incorrect timestamps).

If the initial transcript is already 100% accurate, set "isCorrect" to true.
If there are errors, set "isCorrect" to false and provide the FULL corrected transcript in SRT format in the "correctedTranscript" field.

Initial Transcript:
{{transcript}}`

interface CorrectionResponse {
	isCorrect: boolean
	correctedTranscript?: string
}

const CORRECTION_SCHEMA = {
	type: 'object',
	properties: {
		isCorrect: { type: 'boolean', description: 'True if the initial transcript is perfectly accurate, false otherwise.' },
		correctedTranscript: { type: 'string', description: 'The full corrected transcript in SRT format. Leave empty if isCorrect is true.' }
	},
	required: ['isCorrect']
}

/**
 * Normalizes a timestamp string to HH:MM:SS,mmm format.
 * Handles various inputs: MM:SS, HH:MM:SS, MM:SS.mmm, MM:SS,mmm, etc.
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

	// Remove markdown code blocks or stray backticks more aggressively
	let cleanSrt = srt.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()

	// Split by any newline
	const allLines = cleanSrt.split(/\r?\n/).map(l => l.trim())

	const timestampRegex = /((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)/

	for (let i = 0; i < allLines.length; i++) {
		const line = allLines[i]

		// 1. Is it a single number? (SRT Index)
		if (/^\d+$/.test(line)) {
			// 2. Is the next line a timestamp?
			const nextLine = allLines[i + 1]
			if (nextLine && timestampRegex.test(nextLine)) {
				const timeMatch = nextLine.match(timestampRegex)!
				const start = normalizeTimestamp(timeMatch[1])
				const end = normalizeTimestamp(timeMatch[2])

				let textLines: string[] = []
				let j = i + 2
				// 3. Collect all following lines as text until we hit another index line followed by a timestamp
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

				items.push({
					start,
					end,
					text: textLines.join(' ')
				})

				i = j - 1 // Advance i to the last line of the current block
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
 * Extracts a transcript from an audio file using Gemini.
 */
export async function extractTranscriptStructured(
	audioPath: string
): Promise<TranscriptItem[]> {
	const adapter = GeminiAdapter.create()
	console.log('Uploading audio to Gemini:', audioPath)
	const fileUri = await adapter.uploadFile(audioPath, 'audio/mpeg')

	console.log('Generating initial transcript from audio (SRT format)...')
	const initialSrtText = await adapter.generateTextFromFiles(
		TRANSCRIPT_PROMPT,
		[fileUri]
	)

	console.log('Verifying and correcting transcript...')
	const correctionResult = await adapter.generateStructuredFromFiles<CorrectionResponse>(
		TRANSCRIPT_CORRECTION_PROMPT.replace('{{transcript}}', initialSrtText),
		[fileUri],
		CORRECTION_SCHEMA
	)

	let finalSrtText = initialSrtText
	if (!correctionResult.isCorrect && correctionResult.correctedTranscript) {
		console.log('Corrected transcript received.')
		finalSrtText = correctionResult.correctedTranscript
	} else {
		console.log('Transcript verified as accurate.')
	}

	const transcript = parseSRT(finalSrtText)

	if (transcript.length === 0 && finalSrtText.trim() !== '') {
		console.warn('Failed to parse any segments from SRT response. Returning raw text as single segment.')
		return [{
			start: '00:00',
			end: '00:00',
			text: finalSrtText
		}]
	}

	return transcript
}
