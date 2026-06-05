'use client'

import type { GitHubComment } from '@/lib/github'
import { timeAgo } from '@/lib/date'
import { ExternalLinkIcon } from '@/components/icons'
import { MarkdownBody } from './MarkdownBody'

interface CommentItemProps {
  comment: GitHubComment
  /** When true, renders as a compact inline style (used inside review threads). */
  compact?: boolean
}

/** Renders a single issue comment or review thread reply. */
export function CommentItem({ comment, compact = false }: CommentItemProps) {
  return (
    <div className={`flex items-start gap-3 ${
      compact
        ? 'px-3 py-2.5 border-b border-border last:border-0 bg-background'
        : 'p-3 rounded-lg bg-muted/40 border border-border'
    }`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={comment.user.avatar_url}
        alt={comment.user.login}
        className="w-6 h-6 rounded-full shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">{comment.user.login}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
          <a
            href={comment.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-muted-foreground/30 hover:text-primary transition-colors"
            title="Open in GitHub"
          >
            <ExternalLinkIcon />
          </a>
        </div>
        <MarkdownBody content={comment.body} />
      </div>
    </div>
  )
}
