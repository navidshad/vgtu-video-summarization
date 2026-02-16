<div align="center">

# 🎬 VGTU Video Summarization
### *AI-Powered Multimodal Video Highlighting*

[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)

---

**VGTU Video Summarization** is a high-fidelity application that transforms long-form video content into concise, meaningful highlights. By blending **Google Gemini's** multimodal intelligence with precise **FFmpeg** engineering, it provides a seamless chat-based refinement experience.

[**Explore Architecture**](./docs/architecture.md) • [**UI/UX Design**](./docs/ui_ux.md) • [**Setup Guide**](./docs/setup.md)

</div>

---

## 🧭 Navigation
| Section | Description |
| :--- | :--- |
| 📦 **[Deliverables](#-deliverables)** | What's included in this repository. |
| 🧠 **[The Pipeline](#-the-ai-pipeline-highlights)** | How the AI "thinks" and generates summaries. |
| 🎨 **[Experience](#-ux-highlights)** | Interactive features and versioning system. |
| 🛠 **[Reproducibility](#-reproducibility--seed)** | Details on deterministic AI and environmental consistency. |
| 🚀 **[Getting Started](#-getting-started)** | Prerequisites and launch instructions. |

---

## 📦 Deliverables
This formal homework project delivers a complete production-grade ecosystem:
*   **Production Code**: Electron desktop app written in Vue 3 & TypeScript.
*   **AI Engine**: A 4-phase pipeline (Extraction, Intent, Generation, Assembly).
*   **Reproduction Tools**: Sample metadata and transcripts in the `data/` directory.
*   **Visual Documentation**: Fully documented [Architecture](./docs/architecture.md) and [UI/UX Flow](./docs/ui_ux.md).

---

## 🧠 The AI Pipeline (Highlights)
Our unique **4-Phase Engine** ensures that every summary is contextually accurate:
*   **Intent Recognition**: Uses a "Brain" node to distinguish between chat and generation, preventing token waste.
*   **Iterative Refinement**: Supports an **Edit Mode** that performs a technical "diff" on previous timelines for perfect consistency.
*   **Multimodal Fusion**: Processes visual scene transitions, audio transcripts, and user context simultaneously.

> [!TIP]
> **Deep Dive:** Check out the **[Architecture Deep-Dive](./docs/architecture.md)** for Mermaid diagrams and logic breakdowns.

---

## 🎨 UX Highlights
The interface is designed for **transparency** and **iterative control**:
*   **Version History**: Switch between generated versions instantly to find the best cut.
*   **Live Token Metrics**: Monitor AI usage costs and token counts in real-time.
*   **Zero-Config Preprocessing**: Automatic scene detection and transcript extraction upon upload.

---

## 🛠 Reproducibility & Seed
To guarantee identical behavior across different environments:
*   **JSON Enforcement**: Strict schemas ensure deterministic AI responses.
*   **Precision Slicing**: FFmpeg settings calibrated for frame-accurate cuts.
*   **Dependency Guard**: Locked environments via `package-lock.json` and `.npmrc`.
*   **Reference Stability**: Edit mode always builds upon a fixed "Seed" timeline to avoid hallucinations.

---

## 🚀 Getting Started
Check the **[Installation & Setup Guide](./docs/setup.md)** to configure:
1.  **Environment**: Node.js and Gemini API Key.
2.  **Tools**: FFmpeg and PySceneDetect for your OS.
3.  **Launch**: `npm install && npm run dev`.

---

## 📸 Final Snapshot
<div align="center">
  <img src="./docs/imgs/screenshot_chatpage.png" width="800px" alt="App Screenshot" />
</div>

---

## 📜 License
Licensed under the MIT License - see [LICENSE](LICENSE) for details.

