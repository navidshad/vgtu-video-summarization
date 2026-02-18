import { TranscriptItem } from '../gemini/utils'

export interface SceneDescription {
	index: number
	startTime: number
	description: string
}

const MIN_GAP_DURATION = 2.0 // Minimum 2 seconds gap to insert a visual scene

/**
 * Enriches the transcript by filling gaps with visual scene descriptions.
 */
export function enrichTranscriptWithScenes(
	transcript: TranscriptItem[],
	sceneDescriptions: SceneDescription[],
	totalDuration: number
): TranscriptItem[] {
	// 1. Convert transcript times to seconds for easier processing
	const sortedTranscript = [...transcript].sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start))
	const enrichedItems: TranscriptItem[] = []

	// 2. Helper to find relevant scene description for a timestamp
	const getSceneForTime = (time: number): string | null => {
		// Find the scene that started most recently before this time
		// or assumes scenes are roughly sequential
		// sceneDescriptions usually has index, startTime. We assume scenes cover the video.
		// We find the scene with largest startTime <= time
		let bestScene: SceneDescription | null = null
		for (const scene of sceneDescriptions) {
			if (scene.startTime <= time) {
				if (!bestScene || scene.startTime > bestScene.startTime) {
					bestScene = scene
				}
			}
		}
		return bestScene ? bestScene.description : null
	}

	// 3. Iterate transcript to find gaps
	let previousEnd = 0.0

	for (const item of sortedTranscript) {
		const start = timeToSeconds(item.start)
		const end = timeToSeconds(item.end)

		// Check for gap
		if (start - previousEnd > MIN_GAP_DURATION) {
			const gapStart = previousEnd
			const gapEnd = start
			const gapDuration = gapEnd - gapStart
			const midPoint = gapStart + (gapDuration / 2)

			const visualDescription = getSceneForTime(midPoint)
			if (visualDescription) {
				enrichedItems.push({
					start: secondsToTime(gapStart),
					end: secondsToTime(gapEnd),
					text: `[Visual Scene: ${visualDescription}]`
				})
			}
		}

		enrichedItems.push(item)
		previousEnd = end
	}

	// 4. Check for trailing gap
	if (totalDuration - previousEnd > MIN_GAP_DURATION) {
		const gapStart = previousEnd
		const gapEnd = totalDuration
		const midPoint = gapStart + ((gapEnd - gapStart) / 2)

		const visualDescription = getSceneForTime(midPoint)
		if (visualDescription) {
			enrichedItems.push({
				start: secondsToTime(gapStart),
				end: secondsToTime(gapEnd),
				text: `[Visual Scene: ${visualDescription}]`
			})
		}
	}

	return enrichedItems
}

// Helpers
function timeToSeconds(t: string): number {
	const clean = t.trim().replace(',', '.')
	const [timePart, milliPart = '0'] = clean.split('.')
	const parts = timePart.split(':').map(Number)

	let seconds = 0
	if (parts.length === 3) {
		seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
	} else if (parts.length === 2) {
		seconds = parts[0] * 60 + parts[1]
	} else if (parts.length === 1) {
		seconds = parts[0]
	}

	return seconds + parseFloat(`0.${milliPart}`)
}

function secondsToTime(totalSeconds: number): string {
	const hh = Math.floor(totalSeconds / 3600)
	const mm = Math.floor((totalSeconds % 3600) / 60)
	const ss = Math.floor(totalSeconds % 60)
	const ms = Math.round((totalSeconds % 1) * 1000)

	const pad = (n: number, z = 2) => n.toString().padStart(z, '0')
	return `${pad(hh)}:${pad(mm)}:${pad(ss)},${ms.toString().padStart(3, '0')}`
}
