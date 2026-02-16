import { promises as fs } from 'fs'
import { SceneDetector } from './index'

async function run() {
    const videoPath = process.argv[2]
    if (!videoPath) {
        console.error('Usage: tsx dump-scenes.ts <videoPath>')
        process.exit(1)
    }

    try {
        const stat = await fs.stat(videoPath)
        if (!stat.isFile()) {
            console.error(`Error: Path is not a file: "${videoPath}"`)
            process.exit(1)
        }
    } catch (err) {
        if ((err as any).code === 'ENOENT') {
            console.error(`Error: File not found: "${videoPath}"`)
        } else {
            console.error(`Error checking file: "${videoPath}"`, err)
        }
        process.exit(1)
    }

    try {
        const detector = new SceneDetector()
        const scenes = await detector.detectScenes(videoPath)
        // Print ONLY the JSON string on the last line
        console.log(JSON.stringify(scenes))
    } catch (err) {
        console.error('Error detecting scenes:', err)
        process.exit(1)
    }
}

run()
