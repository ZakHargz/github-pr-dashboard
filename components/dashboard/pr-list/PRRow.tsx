'use client'

import type { GitHubPR, CIStatus, ReviewSummary } from '@/lib/github'
import { timeAgo } from '@/lib/date'
import { PRIcon, DraftIcon, BotPRIcon } from '@/components/icons'
import { CIStatusDot } from './CIStatusDot'
import { ReviewBadges } from './ReviewBadges'

function isDependabot(pr: GitHubPR): boolean {
  const login = pr.user.login.toLowerCase()
  return login === 'dependabot[bot]' || login === 'dependabot' || login.startsWith('dependabot')
}

interface PRRowProps {
  pr: GitHubPR
  isSelected: boolean
  ciStatus: CIStatus | null | undefined
  reviewSummary: ReviewSummary | undefined
  onSelect: (pr: GitHubPR) => void
}

/** A single PR row button in the sidebar list. */
export function PRRow({ pr, isSelected, ciStatus, reviewSummary, onSelect }: PRRowProps) {
  const isBot = isDependabot(pr)

  return (
    <button
      id={`pr-${pr.id}`}
      onClick={() => onSelect(pr)}
      className={`w-full text-left px-3 py-2.5 border-t border-border transition-colors ${
        isSelected
          ? 'bg-primary/10 border-l-2 border-l-primary pl-[10px]'
          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* CI dot + PR type icon */}
        <div className="flex items-center gap-1 mt-0.5 shrink-0">
          <CIStatusDot status={ciStatus} />
          {pr.draft ? <DraftIcon /> : isBot ? <BotPRIcon /> : <PRIcon />}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium line-clamp-2 leading-snug ${
            isSelected ? 'text-primary' : 'text-foreground'
          }`}>
            {pr.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">#{pr.number}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timeAgo(pr.updated_at)}</span>
            {pr.draft && <span className="text-xs text-muted-foreground italic">· draft</span>}
            {reviewSummary && (reviewSummary.approved > 0 || reviewSummary.changesRequested > 0) && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <ReviewBadges summary={reviewSummary} />
              </>
            )}
          </div>

          {/* Labels */}
          {pr.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {pr.labels.slice(0, 3).map(label => (
                <span
                  key={label.id}
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `#${label.color}22`,
                    color: `#${label.color}`,
                    border: `1px solid #${label.color}44`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Requested reviewers */}
          {pr.requested_reviewers.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {pr.requested_reviewers.slice(0, 4).map(r => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={r.login}
                  src={r.avatar_url}
                  alt={r.login}
                  title={r.login}
                  className="w-4 h-4 rounded-full ring-1 ring-border"
                />
              ))}
              <span className="text-xs text-muted-foreground ml-0.5">
                {pr.requested_reviewers.length === 1
                  ? pr.requested_reviewers[0].login
                  : `${pr.requested_reviewers.length} reviewers`}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
