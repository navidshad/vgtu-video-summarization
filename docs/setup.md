# 🛠 Installation & Setup Guide

This guide provides detailed instructions on how to set up the environment and run the **VGTU Video Summarization** application.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/app/apikey)) — *Ask us if you need an API key to test this project.*

### 🛠 External Tool Setup
The application relies on **FFmpeg** for video processing and **PySceneDetect** for scene analysis.

#### 🍏 macOS
1. **FFmpeg**: Install via [Homebrew](https://brew.sh/):
   ```bash
   brew install ffmpeg
   ```
2. **PySceneDetect**: Install via pip (requires Python):
   ```bash
   pip install scenedetect
   ```

#### 🪟 Windows
1. **Chocolatey**: Ensure [Chocolatey](https://chocolatey.org/install) is installed to manage packages.
2. **FFmpeg**: Install via terminal (Run as Administrator):
   ```bash
   choco install ffmpeg
   ```
3. **PySceneDetect**:
   There are two options to install PySceneDetect:
   1. **(Python Package Option)**: 
      - Ensure [Python](https://www.python.org/) is installed and added to PATH. 
      - Install via terminal:
        ```bash
        pip install scenedetect
        ``` 
   2. **PySceneDetect (Windows Installer)**: 
      - Download the installer from [PySceneDetect Download](https://www.scenedetect.com/download).
      - Run the installer and follow the instructions.
      - You might need to install open-cv as well:
        ```bash
        pip install opencv-python
        ```

---

## 💻 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/navidshad/vgtu-video-summarization.git
   cd vgtu-video-summarization
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Start the application**:
   ```bash
   yarn dev
   ```
