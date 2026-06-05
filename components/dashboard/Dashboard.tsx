'use client'

import { useState, useCallback } from 'react'
import type { GitHubPR } from '@/lib/github'
import { usePRData } from '@/hooks/use-pr-data'
import { usePRDetail } from '@/hooks/use-pr-detail'
import { useKeyboardNav } from '@/hooks/use-keyboard-nav'
import PRList from './pr-list/PRList'
import PRDetail from './pr-detail/PRDetail'

const STORAGE_EXPANDED = 'gh_expanded_repos'

interface DashboardProps {
  token: string
  repos: string[]
  currentUser: string | null
  onSettings: () => void
}

/**
 * Orchestrates the main dashboard view — PR list sidebar + detail panel.
 *
 * State ownership:
 *  - expanded (which repo groups are open) — local, persisted to localStorage
 *  - PR list data — delegated to usePRData
 *  - PR detail data — delegated to usePRDetail
 *  - Keyboard navigation — delegated to useKeyboardNav
 */
export default function Dashboard({ token, repos, currentUser, onSettings }: DashboardProps) {
  // Which repo groups are expanded in the sidebar (persisted).
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const stored = JSON.parse(localStorage.getItem(STORAGE_EXPANDED) ?? '[]') as string[]
    return new Set(stored)
  })

  const {
    prs, listLoading, listErrors, lastRefreshed,
    ciStatuses, reviewSummaries,
    autoRefresh, refresh, toggleAutoRefresh,
  } = usePRData({ token, repos, active: true })

  const {
    selectedPR, detail, detailLoading, detailError,
    selectDetail, reset: resetDetail,
  } = usePRDetail(token)

  // Coordinate PR selection: auto-expand the repo group then fetch detail.
  const selectPR = useCallback(async (pr: GitHubPR) => {
    setExpanded(prev => {
      if (prev.has(pr.repo)) return prev
      const next = new Set(prev)
      next.add(pr.repo)
      localStorage.setItem(STORAGE_EXPANDED, JSON.stringify([...next]))
      return next
    })
    await selectDetail(pr)
  }, [selectDetail])

  // Refresh and clear the current selection.
  const handleRefresh = useCallback(() => {
    resetDetail()
    refresh()
  }, [resetDetail, refresh])

  function toggleRepo(repo: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(repo)) { next.delete(repo) } else { next.add(repo) }
      localStorage.setItem(STORAGE_EXPANDED, JSON.stringify([...next]))
      return next
    })
  }

  useKeyboardNav({
    prs,
    selectedPR,
    onSelect: selectPR,
    onRefresh: handleRefresh,
  })

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <PRList
        prs={prs}
        loading={listLoading}
        errors={listErrors}
        selectedId={selectedPR?.id ?? null}
        onSelect={selectPR}
        onRefresh={handleRefresh}
        onSettings={onSettings}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={toggleAutoRefresh}
        lastRefreshed={lastRefreshed}
        expanded={expanded}
        onToggleRepo={toggleRepo}
        ciStatuses={ciStatuses}
        reviewSummaries={reviewSummaries}
        currentUser={currentUser}
      />
      <PRDetail
        pr={detail}
        loading={detailLoading}
        error={detailError}
      />
    </div>
  )
}
