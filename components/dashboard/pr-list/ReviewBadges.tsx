'use client'

import type { ReviewSummary } from '@/lib/github'
import { CheckIcon, XIcon } from '@/components/icons'

interface ReviewBadgesProps {
  summary: ReviewSummary
}

/** Compact approved/changes-requested counts shown in a PR row. */
export function ReviewBadges({ summary }: ReviewBadgesProps) {
  return (
    <span className="flex items-center gap-1 text-xs tabular-nums">
      {summary.approved > 0 && (
        <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
          <CheckIcon />{summary.approved}
        </span>
      )}
      {summary.changesRequested > 0 && (
        <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
          <XIcon />{summary.changesRequested}
        </span>
      )}
    </span>
  )
}
