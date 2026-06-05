'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchOpenPRs, fetchCIStatus, fetchReviewSummary,
  GitHubSAMLError,
  type GitHubPR, type CIStatus, type ReviewSummary,
} from '@/lib/github'
import type { RepoError } from '@/types'

const STORAGE_AUTO_REFRESH = 'gh_auto_refresh'
const AUTO_REFRESH_MS = 5 * 60 * 1000 // 5 minutes

interface UsePRDataOptions {
  token: string
  repos: string[]
  /** Whether the dashboard is currently the active view. */
  active: boolean
}

/**
 * Manages all PR list state including loading, background enrichment
 * (CI status + review summaries), and optional auto-refresh.
 *
 * Effects owned here:
 *  - Reads autoRefresh preference from localStorage on mount
 *  - Triggers initial loadPRs when the dashboard becomes active
 *  - Manages the 5-minute auto-refresh setInterval
 */
export function usePRData({ token, repos, active }: UsePRDataOptions) {
  const [prs, setPrs] = useState<GitHubPR[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listErrors, setListErrors] = useState<RepoError[]>([])
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [ciStatuses, setCIStatuses] = useState<Map<number, CIStatus | null>>(new Map())
  const [reviewSummaries, setReviewSummaries] = useState<Map<number, ReviewSummary>>(new Map())

  // Hydrate autoRefresh from localStorage (SSR-safe).
  useEffect(() => {
    setAutoRefresh(localStorage.getItem(STORAGE_AUTO_REFRESH) === 'true')
  }, [])

  const loadPRs = useCallback(async (tok: string, repoList: string[]) => {
    setListLoading(true)
    setListErrors([])
    setPrs([])
    setCIStatuses(new Map())
    setReviewSummaries(new Map())

    try {
      const results = await Promise.allSettled(repoList.map(r => fetchOpenPRs(tok, r)))
      const allPRs: GitHubPR[] = []
      const errors: RepoError[] = []

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          allPRs.push(...result.value)
        } else {
          const err = result.reason
          if (err instanceof GitHubSAMLError) {
            errors.push({ repo: repoList[i], message: err.message, isSAML: true, samlOrg: err.org })
          } else {
            errors.push({
              repo: repoList[i],
              message: err instanceof Error ? err.message : 'Unknown error',
              isSAML: false,
            })
          }
        }
      })

      allPRs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      setPrs(allPRs)
      setListErrors(errors)
      setLastRefreshed(new Date())

      // Background: stream CI status + review summary per PR as they resolve.
      for (const pr of allPRs) {
        fetchCIStatus(tok, pr.repo, pr.head.sha)
          .then(status => setCIStatuses(prev => new Map(prev).set(pr.id, status)))
          .catch(() => {})

        fetchReviewSummary(tok, pr.repo, pr.number)
          .then(summary => setReviewSummaries(prev => new Map(prev).set(pr.id, summary)))
          .catch(() => {})
      }
    } catch (e) {
      setListErrors([{
        repo: '',
        message: e instanceof Error ? e.message : 'Failed to fetch PRs',
        isSAML: false,
      }])
    } finally {
      setListLoading(false)
    }
  }, [])

  // Trigger initial load when the dashboard becomes active.
  useEffect(() => {
    if (active && token && repos.length > 0) {
      loadPRs(token, repos)
    }
  }, [active, token, repos, loadPRs])

  // Auto-refresh interval.
  useEffect(() => {
    if (!autoRefresh || !active || !token || repos.length === 0) return
    const id = setInterval(() => loadPRs(token, repos), AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [autoRefresh, active, token, repos, loadPRs])

  function toggleAutoRefresh() {
    const next = !autoRefresh
    setAutoRefresh(next)
    localStorage.setItem(STORAGE_AUTO_REFRESH, String(next))
  }

  return {
    prs,
    listLoading,
    listErrors,
    lastRefreshed,
    ciStatuses,
    reviewSummaries,
    autoRefresh,
    loadPRs,
    refresh: () => loadPRs(token, repos),
    toggleAutoRefresh,
  }
}
