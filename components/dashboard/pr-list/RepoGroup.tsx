'use client'

import type { GitHubPR, CIStatus, ReviewSummary } from '@/lib/github'
import { ChevronIcon, BotIcon } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { PRRow } from './PRRow'

function isDependabot(pr: GitHubPR): boolean {
  const login = pr.user.login.toLowerCase()
  return login === 'dependabot[bot]' || login === 'dependabot' || login.startsWith('dependabot')
}

interface RepoGroupProps {
  repo: string
  prs: GitHubPR[]
  isExpanded: boolean
  selectedId: number | null
  ciStatuses: Map<number, CIStatus | null>
  reviewSummaries: Map<number, ReviewSummary>
  onToggle: () => void
  onSelectPR: (pr: GitHubPR) => void
}

/** Collapsible group of PRs for a single repository. */
export function RepoGroup({
  repo, prs, isExpanded, selectedId,
  ciStatuses, reviewSummaries,
  onToggle, onSelectPR,
}: RepoGroupProps) {
  const botPRs = prs.filter(isDependabot)
  const humanPRs = prs.filter(pr => !isDependabot(pr))
  const botCount = botPRs.length
  const humanCount = humanPRs.length
  const hasSelected = prs.some(pr => pr.id === selectedId)
  const humanAuthors = [...new Set(humanPRs.map(pr => pr.user.login))]

  return (
    <div className="border-b border-border last:border-0">
      {/* Repo group header */}
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors text-left"
        >
          <ChevronIcon expanded={isExpanded} />
          <span className="flex-1 min-w-0 text-xs font-semibold text-foreground/70 truncate">
            {repo.split('/')[1]}
            <span className="font-normal text-muted-foreground ml-1">· {repo.split('/')[0]}</span>
          </span>
        </button>

        {/* Badges outside the toggle button to avoid button-in-button nesting */}
        <div className="flex items-center gap-1 pr-3 shrink-0">
          <Badge variant={hasSelected && !isExpanded ? 'default' : 'secondary'} className="tabular-nums">
            {prs.length}
          </Badge>

          {humanCount > 0 && botCount > 0 && (
            <Tooltip>
              <TooltipTrigger className="inline-flex cursor-default bg-transparent border-0 p-0 outline-none focus-visible:outline-none">
                <Badge variant="outline" className="gap-0.5 tabular-nums cursor-default font-normal">
                  {humanCount}<span className="text-muted-foreground/50 mx-0.5">·</span><BotIcon />{botCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {humanAuthors.join(' · ')} +{botCount} bot PR{botCount !== 1 ? 's' : ''}
              </TooltipContent>
            </Tooltip>
          )}

          {humanCount === 0 && botCount > 0 && (
            <Tooltip>
              <TooltipTrigger className="inline-flex cursor-default bg-transparent border-0 p-0 outline-none focus-visible:outline-none">
                <Badge variant="outline" className="gap-0.5 cursor-default font-normal">
                  <BotIcon />all
                </Badge>
              </TooltipTrigger>
              <TooltipContent>All {botCount} PR{botCount !== 1 ? 's' : ''} from Dependabot</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* PR rows */}
      {isExpanded && prs.map(pr => (
        <PRRow
          key={pr.id}
          pr={pr}
          isSelected={selectedId === pr.id}
          ciStatus={ciStatuses.get(pr.id)}
          reviewSummary={reviewSummaries.get(pr.id)}
          onSelect={onSelectPR}
        />
      ))}
    </div>
  )
}
