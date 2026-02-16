# 🎨 UI & User Experience

The front-end is built to feel premium, responsive, and data-rich, guiding the user through a complex AI workflow with ease.

## 🛠 Tech Stack
- **Framework**: Vue 3 with Vite.
- **Styling**: Tailwind CSS for a modern, "glassmorphism" aesthetic.
- **State Management**: Pinia (Modules for Threads, Settings, and API configuration).

---

## 🧭 User Flow

### 1. Project Initialization
Users start by providing a **Gemini API Key**. This is stored locally and used for all multimodal requests.

### 2. Upload & Exploration
Upon uploading a video, the app enters the **Analysis View**. 
- **Real-time Logs**: Users see exactly what the pipeline is doing (Extractions, Scene Detection).
- **Video Preview**: A low-res preview is generated for immediate playback.

### 3. Interactive Chat & Refinement
The heart of the app is the **Chat Interface** (`src/renderer/src/pages/ChatPage.vue`).
- **Context-Aware Messages**: The AI remembers the video content and previous summary versions.
- **Version Tracking**: Every "Generate" command creates a new version of the video. Users can switch between versions to compare results.

---

## 🧩 Key Components

- **`ChatMessage.vue`**: Handles both text bubbles and video preview cards. It includes token usage and cost tracking for transparency.
- **`TimelineViewer.vue`**: Visualizes the AI-selected segments as a checklist.
- **`ThreadList.vue`**: Allows users to manage multiple video projects simultaneously.

---

## ✨ Design Principles
- **Clarity**: High-contrast labels for "User" vs "AI" messages.
- **Transparency**: AI "Thinking" states are visible via status updates from the main process pipeline.
- **Efficiency**: Only the necessary parts of the UI re-render when a new video version is assembled.
