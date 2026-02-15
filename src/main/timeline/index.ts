import { TimelineSegment } from '../../shared/types'
import { TranscriptItem, generateSRT } from '../gemini/utils'

export interface TimelineGenerationAdapter {
    generateText(prompt: string, systemInstruction?: string): Promise<{ text: string; record: import('../../shared/types').UsageRecord }>;
}

export async function generateTimeline(
    userExpectation: string,
    allSegments: TranscriptItem[],
    targetDuration: number,
    geminiAdapter: TimelineGenerationAdapter,
    updateStatus: (status: string) => void,
    recordUsage: (record: import('../../shared/types').UsageRecord) => void,
    baseTimeline: TimelineSegment[] = []
): Promise<TimelineSegment[]> {

    const fullTimelineSRT = generateSRT(allSegments);

    const currentShorterTimeline: TimelineSegment[] = [...baseTimeline];
    let currentDuration = calculateTotalDuration(currentShorterTimeline);

    let iterationCount = 0;
    const MAX_ITERATIONS = 20; // Safety break

    const systemInstruction = `
You are a video editor assistant.
Your task is to select the next best segments from the full transcript to build a shorter video timeline based on the user's request.
Return ONLY a JSON array of indices (integers) of the selected segments, e.g. [1, 5, 8].
Do not include any other text.
`;

    while (currentDuration < targetDuration && iterationCount < MAX_ITERATIONS) {
        iterationCount++;
        // Log status
        updateStatus(`Phase 2: Iteration ${iterationCount} - Duration: ${currentDuration.toFixed(1)}s / ${targetDuration}s`);

        // Construct current timeline text for prompt
        // Format: "• 3 duration, dialogue text"
        const formattedCurrentTimeline = currentShorterTimeline.length > 0
            ? currentShorterTimeline.map(s => `• ${s.duration.toFixed(1)}s duration, ${s.text}`).join('\n')
            : '• empty';

        // Construct prompt
        const prompt = `
User Request: ${userExpectation}
Target Duration: ${targetDuration} seconds

-----------------
Full timeline (SRT):
${fullTimelineSRT}
-----------------

Current built timeline (${currentDuration.toFixed(1)}s):
${formattedCurrentTimeline}

-----------------
Task: Pick the next 3 segments to add to the timeline.
`;

        try {
            // Using generateText because generateStructuredText might be overkill or strict schema might be annoying if Gemini adds text.
            // But let's try to parse a simple JSON array from text.
            const { text: responseText, record } = await geminiAdapter.generateText(prompt, systemInstruction);
            console.log(`Gemini response (Iteration ${iterationCount}):`, responseText);

            // Record usage for each iteration
            recordUsage(record);

            const indices = parseIndicesFromResponse(responseText);

            if (indices.length === 0) {
                console.warn("No indices returned from Gemini, stopping loop.");
                break;
            }

            let addedCount = 0;
            for (const idx of indices) {
                // SRT index is usually 1-based.
                // We need to match this index to our `allSegments`.
                // Assuming `allSegments` array is 0-indexed and corresponds to SRT index 1..N
                const segmentIndex = idx - 1;

                if (segmentIndex >= 0 && segmentIndex < allSegments.length) {
                    const originalSegment = allSegments[segmentIndex];

                    // Check if already added to avoid duplicates if that's a requirement (not strictly specified but good practice)
                    // Re-using clips might be valid, but let's check for exact object identity or index presence.
                    const alreadyExists = currentShorterTimeline.some(s => s.index === idx);
                    if (!alreadyExists) {
                        const duration = calculateDuration(originalSegment.start, originalSegment.end);
                        const timelineSegment: TimelineSegment = {
                            index: idx,
                            start: originalSegment.start,
                            end: originalSegment.end,
                            text: originalSegment.text,
                            duration: duration
                        };

                        currentShorterTimeline.push(timelineSegment);
                        addedCount++;
                    }
                }
            }

            if (addedCount === 0) {
                console.warn("Gemini returned indices but none were valid or new. Stopping to avoid infinite loop.");
                break;
            }

            currentDuration = calculateTotalDuration(currentShorterTimeline);

        } catch (error) {
            console.error("Error in generateTimeline iteration:", error);
            updateStatus(`Error in AI generation: ${error instanceof Error ? error.message : String(error)}`);
            break;
        }
    }

    return currentShorterTimeline;
}

function calculateDuration(start: string, end: string): number {
    // Helper to parse time string to seconds
    // Format is likely HH:MM:SS,mmm or HH:MM:SS.mmm
    const parseSeconds = (t: string) => {
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

    return parseSeconds(end) - parseSeconds(start)
}

function calculateTotalDuration(segments: TimelineSegment[]): number {
    return segments.reduce((acc, curr) => acc + curr.duration, 0);
}

function parseIndicesFromResponse(text: string): number[] {
    // Extract JSON array
    const jsonMatch = text.match(/\[([\d,\s]+)\]/);
    if (jsonMatch) {
        return jsonMatch[1]
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));
    }
    return [];
}