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

	const simplifyTime = (t: string) => {
		const timeOnly = t.split(/[.,]/)[0]
		const parts = timeOnly.split(':')
		if (parts.length === 3 && (parts[0] === '00' || parts[0] === '0')) {
			return `${parts[1]}:${parts[2]}`
		}
		return timeOnly
	}

	for (let i = 0; i < allLines.length; i++) {
		const line = allLines[i]

		// 1. Is it a single number? (SRT Index)
		if (/^\d+$/.test(line)) {
			// 2. Is the next line a timestamp?
			const nextLine = allLines[i + 1]
			if (nextLine && timestampRegex.test(nextLine)) {
				const timeMatch = nextLine.match(timestampRegex)!
				const start = simplifyTime(timeMatch[1])
				const end = simplifyTime(timeMatch[2])

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
		const start = item.start.includes(':') ? item.start : `00:${item.start}`
		const end = item.end.includes(':') ? item.end : `00:${item.end}`

		// Ensure HH:MM:SS,mmm format if possible, but keep it simple if it was already simplified
		const formatTime = (t: string) => {
			const parts = t.split(':')
			if (parts.length === 2) return `00:${parts[0]}:${parts[1]},000`
			return t.includes(',') ? t : `${t},000`
		}

		return `${index + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${item.text}\n`
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

	console.log('Generating transcript from audio (SRT format)...')
	const srtText = await adapter.generateTextFromFiles(
		TRANSCRIPT_PROMPT,
		[fileUri]
	)

	// console.log('Gemini SRT response:', srtText)
	const transcript = parseSRT(srtText)

	if (transcript.length === 0 && srtText.trim() !== '') {
		console.warn('Failed to parse any segments from SRT response. Returning raw text as single segment.')
		return [{
			start: '00:00',
			end: '00:00',
			text: srtText
		}]
	}

	return transcript
}
