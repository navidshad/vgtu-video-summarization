---
name: Frontend Design System
description: Comprehensive guide for creating premium, high-fidelity UI layouts using the project's Vue component library and Tailwind CSS.
---

# Frontend Design System

This skill provides the standards and patterns for building user interfaces in the dashboard application. The goal is to create a **premium, dynamic, and highly polished** user experience that "wows" the user.

## 1. Design Philosophy

- **High-End Aesthetics**: We do not build "MVP-looking" apps. We build refined, polished interfaces.
- **Glassmorphism & Depth**: Utilize layers, blurs (`backdrop-blur-xl`), and subtle transparencies (`bg-white/40`) to create depth.
- **Vibrant Colors**: Use the project's `primary` and `secondary` palette, but often via gradients or low-opacity tints (`bg-primary/10`) rather than solid blocks of harsh color.
- **Dynamic Motion**: Nothing should feel static. Smooth transitions (`duration-500`, `duration-700`), micro-interactions on hover, and entrance animations are required.

## 2. Component Usage

All standard UI elements must come from the internal component library.

**Reference Documentation:**
- [UI Component Library (lib-vue-components)](./lib-vue-components.md) - Contains full list of available components and their props.

```typescript
// Import path
import { Card, Button, Icon } from '@codebridger/lib-vue-components/elements.ts';
import { Modal } from '@codebridger/lib-vue-components/complex.ts';
```

### Key Components
- **Card**: The building block for content.
- **Button**: Use for actions.
- **Icon**: Wrapper for Iconify icons. PREFERRED SET: `iconify solar--*-bold-duotone` or `*-bold`.
- **PageHeader**: Standard top-of-page layout with title, subtitle, and actions.
- **Breadcrumb**: Navigation hierarchy component.

## 3. Layout Patterns

### Main Page Shell
Pages normally live within a `DashboardShell` (via `default` layout). Content should be centered with max-width.

```vue
<template>
    <div class="relative min-h-screen">
		<!-- Decorative Background Elements -->
        <div
            class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none">
        </div>
        <div
            class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none">
        </div>

        <!-- Standard Container -->
        <div class="container relative mx-auto px-6 py-16 max-w-7xl">
            
            <!-- Standard Header Block -->
            <PageHeader
                overline="Section Label"
                title="Page Title"
                subtitle="Descriptive text goes here."
            >
                <template #actions>
                    <!-- Optional Right-side Actions/Status -->
                </template>
            </PageHeader>

            <!-- Content Grid -->
            <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                <slot />
            </div>
        </div>
    </div>
</template>
```

### Card Styling
Cards should rarely be just plain rectangles.

**Premium Card Recipe:**
- **Rounding**: `rounded-[2.5rem]` or `rounded-3xl` (generous curves).
- **Background**: `bg-white dark:bg-gray-800`.
- **Shadow**: Light idle shadow `shadow-[0_4px_20px_rgba(0,0,0,0.03)]` -> Deep hover shadow `hover:shadow-[0_40px_80px_rgba(var(--primary-rgb),0.15)]`.
- **Interaction**: `group hover:-translate-y-3 transition-all duration-700`.
- **Decorations**: Use absolute positioned gradients or icons in the background of cards to add texture.

## 4. Typography Standards

- **Titles (H1-H2)**: `font-black`, `tracking-tight`.
- **Body**: `font-medium` (avoid thin weights for body text to maintain legibility and premium feel).
- **Labels/Meta**: `text-[10px]` or `text-xs`, `font-bold`, `uppercase`, `tracking-widest` (typographic spacing is key for the premium look).
- **Colors**:
  - Primary text: `text-gray-900` / `dark:text-white`
  - Secondary text: `text-gray-500` / `dark:text-gray-400`
  - Accent text: `text-primary`

## 5. Visual Effects & Assets

### Gradients
Use gradients to create "glows".
- *Example*: `bg-gradient-to-br from-primary via-primary-dark to-secondary`

### Glassmorphism
- Use `backdrop-blur-md` or `backdrop-blur-xl`.
- Combine with `bg-white/10` or `bg-white/70`.
- Add `border border-white/20` for the "glass edge" look.

### Background Elements
Add "blobs" behind the main content to avoid empty whitespace looking boring.
```html
<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
```

## 6. Development Checklist

When creating a new page or component:
1. [ ] Did I use `Card` and `Button` from the library?
2. [ ] Are the borders rounded enough (`rounded-2xl+`)?
3. [ ] Is there an entrance animation (e.g., `animate-fade-in-up`)?
4. [ ] Are interactable elements responsive to hover (scale, shadow, lift)?
5. [ ] Is Dark Mode supported (`dark:` variants)?
6. [ ] Did I use the "Solar" icon set (`iconify solar--...`)?
7. [ ] Is the typography hierarchy clear (Big titles, tiny uppercase labels)?
