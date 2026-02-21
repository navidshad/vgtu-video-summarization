# 🎨 UI & User Experience

The front-end is built to feel premium, responsive, and data-rich, guiding the user through a complex AI workflow with ease.

## 🛠 Tech Stack
- **Framework**: Vue 3 with Vite.
- **UI Architecture**: PilotUI (Internal Component System) + Tailwind CSS.
- **Styling**: "Glassmorphism" aesthetic with ambient gradients, backdrop blur, and dark mode support.
- **State Management**: Pinia (Modules for Threads, Settings, and API configuration).

---

## 🧭 User Flow

### 1. Project Initialization
Users start by providing a **Gemini API Key** in the redesigned Settings. This is stored locally and used for all multimodal requests.

### 2. Video Management (Home)
The Home view (`HomePage.vue`) displays a grid of existing video projects using **Thread Cards**. Users can start a new analysis or resume previous sessions.

### 3. Upload & Exploration
Upon uploading a video, the app enters the analysis phase.
- **Real-time Logs**: Users see exactly what the pipeline is doing (Extractions, Scene Detection).
- **Video Preview**: A low-res preview is generated for immediate playback.

### 4. Interactive Chat & Refinement
The heart of the app is the **Chat Interface** (`src/renderer/src/pages/ChatPage.vue`).
- **Context-Aware Messages**: The AI remembers the video content and previous summary versions.
- **Version Tracking**: Every "Generate" command creates a new version of the video. Users can switch between versions to compare results.

---

## 🧩 Key Components

- **`App.vue` (Shell)**: Manages global theme, ambient backgrounds, and navigation state using `AppRoot`.
- **`PageHeader.vue`**: A standardized header component used across pages for title, subtitle, and navigation actions.
- **`ChatMessage.vue`**: Handles both text bubbles and AI results. It embeds `VideoResult` for playback and `TimelineResult` for segment visualization. Includes token usage and cost metrics.
- **`ThreadCard.vue`**: A rich snippet card displaying video project metadata (thumbnail, status, last modified) on the home screen.
- **`TimelineResult.vue`**: Visualizes the AI-selected segments as an interactive list within the chat stream.

---

## ✨ Design Principles
- **Clarity**: High-contrast labels for "User" vs "AI" messages.
- **Transparency**: AI "Thinking" states are visible via status updates. Token usage and costs are explicitly shown.
- **Depth & Immersion**: Use of ambient colored blobs and glass-like surfaces to create a modern, high-end feel.
- **Efficiency**: Only the necessary parts of the UI re-render when a new video version is assembled.
