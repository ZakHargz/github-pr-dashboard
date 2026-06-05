'use client'

import type { GitHubComment } from '@/lib/github'
import { FileIcon } from '@/components/icons'
import { CommentItem } from './CommentItem'

interface ReviewThreadProps {
  /** Flat array: first element is the root comment, remainder are replies. */
  thread: GitHubComment[]
}

/** Renders a review thread: optional file path header, diff hunk, then comments. */
export function ReviewThread({ thread }: ReviewThreadProps) {
  const first = thread[0]
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {first.path && (
        <div className="px-3 py-2 bg-muted border-b border-border flex items-center gap-2">
          <FileIcon />
          <span className="text-xs font-mono text-foreground/70 truncate">{first.path}</span>
          {first.line && (
            <span className="text-xs text-muted-foreground shrink-0 ml-auto">line {first.line}</span>
          )}
        </div>
      )}
      {first.diff_hunk && (
        <pre className="px-3 py-2.5 text-xs font-mono bg-muted/50 border-b border-border overflow-x-auto text-muted-foreground leading-5 max-h-48">
          {first.diff_hunk}
        </pre>
      )}
      {thread.map((comment) => (
        <CommentItem key={comment.id} comment={comment} compact />
      ))}
    </div>
  )
}
