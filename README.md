# 🎬 VGTU Video Summarization (AI-Powered)

![Project Process](./docs/process.jpeg)

## 🌟 Overview
**VGTU Video Summarization** is an advanced AI-driven application designed to transform long-form video content into concise, meaningful summaries. By leveraging state-of-the-art Multimodal LLMs (Google Gemini), the system understands the nuances of video, audio, and transcripts to generate context-aware highlights through an interactive chat interface.

This project was developed as part of the **Video Summarization** homework, focusing on reproducibility, AI integration, and a premium user experience.

---

## 🧠 Logic & Technical Insights
*This section provides a technical breakdown for repository reviewers and instructors.*

The application follows a **multi-phase pipeline** to ensure high-quality results and interactive flexibility:

### 1. Pre-Processing Phase
- **Scene Detection**: Utilizes **FFmpeg** and **PySceneDetect** to identify key visual transitions and shots.
- **Multimodal Extraction**: Audio is extracted and processed to generate a raw transcript using Gemini's native multimodal capabilities (Gemini 1.5/2.0).
- **Metadata Analysis**: Video resolution and duration are fetched to calibrate the summarization engine.

### 2. Intent Recognition (The "Brain")
Before generating a video, the system uses a dedicated **Intent Node**. It analyzes:
- The user's latest request.
- The full conversation history (contextual memory).
- The video transcript.
- *If editing:* The previous version of the timeline.

The AI decides whether to **Chat** (provide insights/planning) or **Generate** (trigger the timeline builder). This prevents unnecessary processing and allows for natural "human-in-the-loop" confirmation.

### 3. Timeline Generation (Zero-Shot & Iterative)
The system generates a **JSON-based Timeline**. 
- **New Summaries**: The AI selects the best moments based on the raw transcript and visual descriptions.
- **Iterative Edits**: When a user asks to "make it shorter" or "focus on the speaker's face," the AI performs a "diff" operation on the `REFERENCE TIMELINE`, ensuring maximum consistency with the previous version while applying requested changes.

### 4. Video Assembly
The final video is assembled using **FFmpeg** with hardware acceleration support (e.g., `h264_videotoolbox` on macOS). The engine handles:
- Precise frame-accurate trimming.
- Concatenation of selected clips.
- Re-encoding for high-quality preview.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Google Gemini API Key**

### 🛠 External Tool Setup
The application relies on **FFmpeg** for video processing and **PySceneDetect** for scene analysis.

#### 🍏 macOS
1. **FFmpeg**: Install via [Homebrew](https://brew.sh/):
   ```bash
   brew install ffmpeg
   ```
2. **PySceneDetect**: Install via pip (requires Python):
   ```bash
   pip install --upgrade scenedetect[opencv-headless]
   ```

#### 🪟 Windows
1. **Chocolatey**: Ensure [Chocolatey](https://chocolatey.org/install) is installed to manage packages.
2. **FFmpeg**: Install via terminal (Run as Administrator):
   ```bash
   choco install ffmpeg
   ```
3. **PySceneDetect**: 
   - Ensure [Python](https://www.python.org/) is installed and added to PATH. 
   - Install via terminal:
     ```bash
     pip install --upgrade scenedetect[opencv-headless]
     ```

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/navidshad/vgtu-video-summarization.git
   cd vgtu-video-summarization
   ```

2. **Configure NPM**:
   Create a `.npmrc` file in the root directory to access the component library:
   ```text
   @codebridger:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Environment Variables**:
   Provide your Gemini API key in the application settings interface upon launch.

5. **Start the application**:
   ```bash
   npm run dev
   ```

---

## 📁 Repository Structure
Following the recommended standards:

- `src/`: Core source code modules (Electron main process & Vue renderer).
- `docs/`: Slides, process diagrams, and UI screenshots.
- `data/`: Sample input metadata and scripts for reproducibility.
- `.agent/`: Agent configuration and skills for development.
- `.github/workflows/`: GitHub Actions workflows for CI/CD.
- `.vscode/settings.json`: VS Code settings for development.
- `electron.vite.config.ts, package.json`: Project configuration and dependencies.

---

## 🛠 Reproducibility & Seed
- **Deterministic JSON**: All AI calls use structured JSON output to ensure consistent parsing across runs.
- **Consistent Slicing**: FFmpeg parameters are tuned for reproducibility across different operating systems.
- **Dependency Locking**: `package-lock.json` ensures consistent environments.

---

## ⚠️ Known Issues
- **First Run**: Pre-processing (transcript extraction) may take 1-2 minutes depending on video length.
- **API Limits**: Subject to Google Gemini's rate limits (Free Tier may experience delays).
- **FFmpeg**: Ensure your version supports H.264 encoding for smooth assembly.

---

## 📸 Final Snapshot
The interface allows for real-time interaction with the video content, enabling users to refine summaries until they are perfect.

![App Screenshot](./docs/screenshot_chatpage.png)

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

