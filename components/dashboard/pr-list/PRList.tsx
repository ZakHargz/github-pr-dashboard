'use client'

import { useState, useEffect } from 'react'
import type { GitHubPR, CIStatus, ReviewSummary } from '@/lib/github'
import type { RepoError } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PRListHeader } from './PRListHeader'
import { RepoGroup } from './RepoGroup'
import { RepoErrorBanner } from './RepoErrorBanner'

function groupByRepo(prs: GitHubPR[]): Map<string, GitHubPR[]> {
  const map = new Map<string, GitHubPR[]>()
  for (const pr of prs) {
    const list = map.get(pr.repo) ?? []
    list.push(pr)
    map.set(pr.repo, list)
  }
  return map
}

interface PRListProps {
  prs: GitHubPR[]
  loading: boolean
  errors: RepoError[]
  selectedId: number | null
  onSelect: (pr: GitHubPR) => void
  onRefresh: () => void
  onSettings: () => void
  autoRefresh: boolean
  onToggleAutoRefresh: () => void
  lastRefreshed: Date | null
  expanded: Set<string>
  onToggleRepo: (repo: string) => void
  ciStatuses: Map<number, CIStatus | null>
  reviewSummaries: Map<number, ReviewSummary>
  currentUser: string | null
}

export default function PRList({
  prs, loading, errors, selectedId, onSelect, onRefresh, onSettings,
  autoRefresh, onToggleAutoRefresh, lastRefreshed,
  expanded, onToggleRepo, ciStatuses, reviewSummaries, currentUser,
}: PRListProps) {
  const [searchText, setSearchText] = useState('')
  const [filterMine, setFilterMine] = useState(false)

  // Force re-render every 30 s to keep relative timestamps fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const displayedPrs = prs.filter(pr => {
    if (searchText && !pr.title.toLowerCase().includes(searchText.toLowerCase())) return false
    if (filterMine && currentUser && !pr.requested_reviewers.some(r => r.login === currentUser)) return false
    return true
  })

  const grouped = groupByRepo(displayedPrs)
  const activeFilters = (searchText ? 1 : 0) + (filterMine ? 1 : 0)

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">
      <PRListHeader
        prCount={prs.length}
        displayedCount={displayedPrs.length}
        loading={loading}
        lastRefreshed={lastRefreshed}
        autoRefresh={autoRefresh}
        searchText={searchText}
        filterMine={filterMine}
        currentUser={currentUser}
        onToggleAutoRefresh={onToggleAutoRefresh}
        onRefresh={onRefresh}
        onSettings={onSettings}
        onSearchChange={setSearchText}
        onToggleFilterMine={() => setFilterMine(f => !f)}
      />

      <ScrollArea className="flex-1">
        {errors.length > 0 && (
          <div className="p-3 space-y-2">
            {errors.map((err, i) => <RepoErrorBanner key={i} error={err} />)}
          </div>
        )}

        {!loading && displayedPrs.length === 0 && errors.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-16 px-4">
            {activeFilters > 0 ? 'No PRs match the current filter.' : 'No open pull requests found.'}
          </p>
        )}

        {Array.from(grouped.entries()).map(([repo, repoPrs]) => (
          <RepoGroup
            key={repo}
            repo={repo}
            prs={repoPrs}
            isExpanded={expanded.has(repo)}
            selectedId={selectedId}
            ciStatuses={ciStatuses}
            reviewSummaries={reviewSummaries}
            onToggle={() => onToggleRepo(repo)}
            onSelectPR={onSelect}
          />
        ))}
      </ScrollArea>
    </aside>
  )
}
