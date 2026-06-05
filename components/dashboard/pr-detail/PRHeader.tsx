'use client'

import type { GitHubPRDetail } from '@/lib/github'
import { timeAgo } from '@/lib/date'
import { ExternalLinkIcon } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

interface PRHeaderProps {
  pr: GitHubPRDetail
}

/** PR title, author, branch info, diff stats, labels, and GitHub link. */
export function PRHeader({ pr }: PRHeaderProps) {
  return (
    <div className="pb-6 border-b border-border mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-lg font-semibold leading-snug">{pr.title}</h1>
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' shrink-0 gap-1.5'}
        >
          <ExternalLinkIcon />
          Open in GitHub
        </a>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pr.user.avatar_url} alt={pr.user.login} className="w-4 h-4 rounded-full" />
          <a
            href={pr.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-foreground/70 hover:underline transition-colors"
          >
            {pr.user.login}
          </a>
        </span>

        <span className="text-border">·</span>
        <span>#{pr.number}</span>

        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
            {pr.head.ref}
          </code>
          <span>→</span>
          <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
            {pr.base.ref}
          </code>
        </span>

        <span className="text-border">·</span>
        <span>Updated {timeAgo(pr.updated_at)}</span>

        {pr.draft && (
          <>
            <span className="text-border">·</span>
            <Badge variant="secondary">Draft</Badge>
          </>
        )}
      </div>

      {/* Diff stats */}
      {pr.additions !== undefined && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-mono font-medium text-green-600 dark:text-green-400">+{pr.additions}</span>
          <span className="text-xs font-mono font-medium text-red-600 dark:text-red-400">−{pr.deletions}</span>
          <span className="text-xs text-muted-foreground">
            {pr.changed_files} file{pr.changed_files !== 1 ? 's' : ''} changed
          </span>
        </div>
      )}

      {/* Labels */}
      {pr.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pr.labels.map((label) => (
            <span
              key={label.id}
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `#${label.color}1a`,
                color: `#${label.color}`,
                border: `1px solid #${label.color}44`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
