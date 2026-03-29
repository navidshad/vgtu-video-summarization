import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true
})

/**
 * Render Markdown content to safe HTML.
 * @param content - The raw markdown string.
 * @returns The rendered HTML string.
 */
export function renderMarkdown(content: string): string {
  if (!content) return ''
  return md.render(content)
}
