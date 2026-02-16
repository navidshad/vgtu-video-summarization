# 🛠 Installation & Setup Guide

This guide provides detailed instructions on how to set up the environment and run the **VGTU Video Summarization** application.

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

## 💻 Installation

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
