---
name: principles
description: Core guidelines and principles for the AI agent in the VGTU Video Summarization project.
---

# Principles Skill

This skill defines the core principles that the AI agent should follow when assisting in the VGTU Video Summarization project.

## Core Principles

1. **Precision in Summarization**: Always aim for the most accurate and concise summary of the video content. Focus on key scenes and core messages.
2. **Structural Integrity**: Ensure all output, especially structured JSON, adheres strictly to the defined schemas to prevent pipeline failures.
3. **User-Centric Design**: Prioritize the user's focus. When generating timelines, consider what a student or researcher would find most valuable.
4. **Efficiency**: Use the most appropriate Gemini model for the task (e.g., Flash for speed, Flash Thinking for complex reasoning) to balance cost and performance.
5. **Transparency**: If a video contains ambiguous content, state it clearly in the scene descriptions rather than hallucinating details.
6. **Code Quality**: All generated code or pipeline steps must follow TypeScript best practices and be well-documented.

## Usage Guidelines

- Use this skill as a reference during the `generation` phase of the pipeline.
- When the agent acts autonomously, it must consult these principles to ensure consistency across different summarization tasks.
