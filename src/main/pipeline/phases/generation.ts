import { PipelineFunction } from '../index'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

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
  context.updateStatus('Phase 2: Building shorter timeline (Iterative)...')

  // 1. Load Local SRT
  const resourcePath = app.isPackaged
    ? path.join(process.resourcesPath, 'resources/sample-str.str')
    : path.join(__dirname, '../../resources/sample-str.str')

  console.log('Loading SRT from:', resourcePath)
  
  try {
    const srtContent = fs.readFileSync(resourcePath, 'utf-8')
    const fullTimeline = parseSRT(srtContent)
    
    // 2. Setup Loop Variables
    const TARGET_DURATION = data.duration || 90 // seconds
    let currentDuration = 0
    const selectedIndices: number[] = []
    let iterationCount = 0
    
    // Use user prompt if available
    if (data.userPrompt) {
      console.log('Using user prompt:', data.userPrompt)
      context.updateStatus(`Phase 2: analyzing with prompt: "${data.userPrompt.substring(0, 30)}..."`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Simulating "Next Available" cursor
    let nextAvailableIndex = 0

    // 3. Iterative Selection Loop
    while (currentDuration < TARGET_DURATION && nextAvailableIndex < fullTimeline.length) {
      iterationCount++
      context.updateStatus(`Phase 2: Iteration ${iterationCount} (Current Duration: ${currentDuration.toFixed(1)}s / ${TARGET_DURATION}s)`)
      
      // Simulate Gemini Processing Delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Construct Prompt (Simulation)
      // On real implementation, we would send:
      // - User Expectation: "Create a highlight reel..."
      // - Previously Selected: selectedIndices
      // - Remaining Timeline: fullTimeline.slice(nextAvailableIndex)
      
      // Simulate Gemini Response: Pick next 3 available segments
      // In reality, Gemini would analyze text and pick best matches
      const batchSize = 3
      const candidates = fullTimeline.slice(nextAvailableIndex, nextAvailableIndex + batchSize)
      
      if (candidates.length === 0) break

      const newPicks = candidates.map(c => c.index)
      
      // Update State
      selectedIndices.push(...newPicks)
      const addedDuration = candidates.reduce((sum, c) => sum + c.duration, 0)
      currentDuration += addedDuration
      
      // Advance cursor
      nextAvailableIndex += batchSize
      
      console.log(`Iteration ${iterationCount}: Added indices ${newPicks.join(', ')}. Duration added: ${addedDuration.toFixed(1)}s. Total: ${currentDuration.toFixed(1)}s`)
    }

    context.updateStatus(`Phase 2: Complete. Selected ${selectedIndices.length} segments. Total Duration: ${currentDuration.toFixed(1)}s`)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Let user see status
    
    // 4. Pass to Next Phase
    context.next({
      originalData: data,
      detailedTimeline: fullTimeline,
      selectedIndices: selectedIndices
    })

  } catch (error) {
    console.error('Error in buildShorterTimeline:', error)
    throw error
  }
}
