'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownBodyProps {
  content: string
}

/** Renders markdown content with GFM support (tables, task lists, strikethrough). */
export function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
