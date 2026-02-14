import { TimelineSegment } from '../../shared/types'
import { TranscriptItem, generateSRT } from '../gemini/utils'
import { GeminiAdapter } from '../gemini/adapter'

export async function generateTimeline(
    userExpectation: string,
    allSegments: TranscriptItem[],
    targetDuration: number,
    updateStatus: (status: string) => void,
    baseTimeline: TimelineSegment[] = [],
    modelName: string,
    mode: 'new' | 'edit'
): Promise<TimelineSegment[]> {

    const geminiAdapter = GeminiAdapter.create();
    const fullTimelineSRT = generateSRT(allSegments);

    if (mode === 'edit') {
        updateStatus(`Phase 2: Editing timeline in one-shot...`);

        const formattedCurrentTimeline = baseTimeline.length > 0
            ? baseTimeline.map(s => `• Index ${s.index}: ${s.duration.toFixed(1)}s duration, ${s.text}`).join('\n')
            : '• empty';

        const systemInstruction = `
You are a video editor assistant.
Your task is to EDIT an existing video timeline based on the user's request.
You are provided with the FULL transcript (SRT) and the CURRENT timeline.
Return ONLY a JSON array of indices (integers) of the segments that should make up the NEW timeline, e.g. [1, 5, 8].
Indices must refer to the indices in the FULL transcript (SRT).
Do not include any other text.
`;

        const prompt = `
User Editing Request: ${userExpectation}

-----------------
FULL transcript (SRT):
${fullTimelineSRT}
-----------------

CURRENT timeline:
${formattedCurrentTimeline}

-----------------
Task: Provide a list of indices representing the new timeline after applying the user's edits.
`;

        try {
            const responseText = await geminiAdapter.generateText(prompt, systemInstruction, modelName);
            console.log(`Gemini response (Edit Mode):`, responseText);

            const indices = parseIndicesFromResponse(responseText);
            const newTimeline: TimelineSegment[] = [];

            for (const idx of indices) {
                const segmentIndex = idx - 1;
                if (segmentIndex >= 0 && segmentIndex < allSegments.length) {
                    const originalSegment = allSegments[segmentIndex];
                    const duration = calculateDuration(originalSegment.start, originalSegment.end);
                    newTimeline.push({
                        index: idx,
                        start: originalSegment.start,
                        end: originalSegment.end,
                        text: originalSegment.text,
                        duration: duration
                    });
                }
            }
            return newTimeline;
        } catch (error) {
            console.error("Error in generateTimeline (Edit Mode):", error);
            updateStatus(`Error in AI generation: ${error instanceof Error ? error.message : String(error)}`);
            return baseTimeline;
        }
    }

    // Non-edit mode (Looping)
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
        updateStatus(`Phase 2: Iteration ${iterationCount} - Duration: ${currentDuration.toFixed(1)}s / ${targetDuration}s`);

        const formattedCurrentTimeline = currentShorterTimeline.length > 0
            ? currentShorterTimeline.map(s => `• ${s.duration.toFixed(1)}s duration, ${s.text}`).join('\n')
            : '• empty';

        const prompt = `
User Request: ${userExpectation}
Target Duration: ${targetDuration} seconds

-----------------
Full transcript (SRT):
${fullTimelineSRT}
-----------------

Current built timeline (${currentDuration.toFixed(1)}s):
${formattedCurrentTimeline}

-----------------
Task: Pick the next 3 segments to add to the timeline.
`;

        try {
            const responseText = await geminiAdapter.generateText(prompt, systemInstruction, modelName);
            console.log(`Gemini response (Iteration ${iterationCount}):`, responseText);

            const indices = parseIndicesFromResponse(responseText);

            if (indices.length === 0) {
                console.warn("No indices returned from Gemini, stopping loop.");
                break;
            }

            let addedCount = 0;
            for (const idx of indices) {
                const segmentIndex = idx - 1;

                if (segmentIndex >= 0 && segmentIndex < allSegments.length) {
                    const originalSegment = allSegments[segmentIndex];
                    const alreadyExists = currentShorterTimeline.some(s => s.index === idx);
                    if (!alreadyExists) {
                        const duration = calculateDuration(originalSegment.start, originalSegment.end);
                        currentShorterTimeline.push({
                            index: idx,
                            start: originalSegment.start,
                            end: originalSegment.end,
                            text: originalSegment.text,
                            duration: duration
                        });
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