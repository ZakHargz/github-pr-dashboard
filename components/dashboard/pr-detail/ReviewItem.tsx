'use client'

import type { GitHubReview } from '@/lib/github'
import { timeAgo } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
import { MarkdownBody } from './MarkdownBody'

const REVIEW_BADGE: Record<string, { label: string; className: string }> = {
  APPROVED: {
    label: 'Approved',
    className: 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/50',
  },
  CHANGES_REQUESTED: {
    label: 'Changes requested',
    className: 'border-red-200 text-red-700 bg-red-50 dark:border-red-900 dark:text-red-400 dark:bg-red-950/50',
  },
  COMMENTED: {
    label: 'Commented',
    className: 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/50',
  },
  DISMISSED: {
    label: 'Dismissed',
    className: 'border-border text-muted-foreground bg-muted',
  },
}

interface ReviewItemProps {
  review: GitHubReview
}

/** Renders a single code review with reviewer avatar, status badge, and body. */
export function ReviewItem({ review }: ReviewItemProps) {
  const badge = REVIEW_BADGE[review.state]
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 bg-muted/40 border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={review.user.avatar_url} alt={review.user.login} className="w-6 h-6 rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{review.user.login}</span>
          {badge && (
            <Badge variant="outline" className={badge.className}>
              {badge.label}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{timeAgo(review.submitted_at)}</span>
        </div>
        {review.body && (
          <div className="mt-1.5">
            <MarkdownBody content={review.body} />
          </div>
        )}
      </div>
    </div>
  )
}
