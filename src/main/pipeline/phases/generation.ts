import { PipelineFunction } from '../index'
import fs from 'fs'

interface TimelineSegment {
  index: number
  start: string
  end: string
  text: string
  duration: number // in seconds
}

// Helper to parse SRT time string (00:00:00,000) to seconds
const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':')
  let h = 0, m = 0, sStr = ''
  
  if (parts.length === 3) {
    h = parseInt(parts[0])
    m = parseInt(parts[1])
    sStr = parts[2]
  } else if (parts.length === 2) {
    m = parseInt(parts[0])
    sStr = parts[1]
  } else {
    return 0
  }
  
  const [seconds, ms] = sStr.split(',')
  return h * 3600 + m * 60 + parseInt(seconds) + parseInt(ms) / 1000
}

const parseSRT = (content: string): TimelineSegment[] => {
  const segments: TimelineSegment[] = []
  const blocks = content.trim().split(/\n\s*\n/)

  blocks.forEach((block) => {
    const lines = block.split('\n')
    if (lines.length >= 3) {
      const index = parseInt(lines[0])
      const [start, end] = lines[1].split(' --> ')
      const text = lines.slice(2).join(' ')
      const duration = parseTime(end) - parseTime(start)
      
      segments.push({
        index,
        start,
        end,
        text,
        duration
      })
    }
  })

  return segments
}

export const buildShorterTimeline: PipelineFunction = async (data, context) => {
  context.updateStatus('Phase 2: Building shorter timeline (Iterative Simulation)...')

  // 1. Load SRT
  const resourcePath = context.preprocessing?.srtPath

  if (!resourcePath || !fs.existsSync(resourcePath)) {
    throw new Error(`Generated SRT file not found at: ${resourcePath}`)
  }

  console.log('Loading SRT from:', resourcePath)
  
  try {
    const srtContent = fs.readFileSync(resourcePath, 'utf-8')
    const fullTimeline = parseSRT(srtContent)
    
    // 2. Setup Loop Variables
    const TARGET_DURATION = data.duration || 90 // seconds (Dynamic or Default)
    let currentDuration = 0
    const selectedIndices: number[] = []
    let iterationCount = 0
    
    // Mocked responses for simulation
    const mockResponses = [
      [3, 7, 11],
      [15, 20, 25]
    ]

    // 3. Iterative Selection Loop
    while (currentDuration < TARGET_DURATION) {
      iterationCount++
      const currentSelectionInfo = selectedIndices.length > 0 
        ? `Selected: [${selectedIndices.join(', ')}] (${currentDuration.toFixed(1)}s)`
        : 'None'

      context.updateStatus(`Phase 2: Iteration ${iterationCount} - Duration: ${currentDuration.toFixed(1)}s / ${TARGET_DURATION}s`)
      
      // Construct Prompt Structure (Simulation)
      const userExpectation = data.userPrompt || "Create a highlight reel of the most impactful moments"
      
      const promptContext = `
      Context:
      - User Expectation: "${userExpectation}"
      - Full Timeline: ${JSON.stringify(fullTimeline.map(s => ({ i: s.index, text: s.text.substring(0, 20) + '...' })))}
      - Current Selection: ${currentSelectionInfo}
      - Remaining Needed: ${(TARGET_DURATION - currentDuration).toFixed(1)}s
      
      Task: Pick the next best segments to add.
      `
      
      console.log(`--- Iteration ${iterationCount} Prompt Construction ---`)
      console.log(promptContext)
      console.log('------------------------------------------------')

      // Simulate Gemini Processing Delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get Mock Response
      const mockBatch = mockResponses[iterationCount - 1]
      
      if (!mockBatch) {
        console.log('Simulation: No more mock responses available. Stopping loop.')
        break
      }

      console.log(`Simulation: Gemini chose indices [${mockBatch.join(', ')}]`)

      // Logic to parse response and validate indices would go here in real implementation
      // For now, we take the mock batch
      
      const newSegments = fullTimeline.filter(s => mockBatch.includes(s.index))
      
      // Update State
      selectedIndices.push(...mockBatch)
      const addedDuration = newSegments.reduce((sum, s) => sum + s.duration, 0)
      currentDuration += addedDuration
      
      console.log(`Iteration ${iterationCount}: Added ${addedDuration.toFixed(1)}s. New Total: ${currentDuration.toFixed(1)}s`)
    }

    context.updateStatus(`Phase 2: Complete. Selected ${selectedIndices.length} segments. Total Duration: ${currentDuration.toFixed(1)}s`)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Let user see status
    
    // 4. Finish Pipeline
    context.finish('Processing complete. Short timeline generated.', undefined, {
      detailedTimeline: fullTimeline,
      selectedIndices: selectedIndices,
      duration: currentDuration
    })

  } catch (error) {
    console.error('Error in buildShorterTimeline:', error)
    throw error
  }
}
