'use client'

import { useState, useEffect } from 'react'
import { fetchPRDetail, type GitHubPR, type GitHubPRDetail } from '@/lib/github'

/**
 * Manages PR detail state: which PR is selected, its full detail data,
 * and loading/error status.
 *
 * Effects owned here:
 *  - Scrolls the selected PR row into view after the DOM settles (rAF).
 */
export function usePRDetail(token: string) {
  const [selectedPR, setSelectedPR] = useState<GitHubPR | null>(null)
  const [detail, setDetail] = useState<GitHubPRDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // After a PR is selected (which may auto-expand a collapsed repo group),
  // wait one animation frame for the DOM to paint, then scroll into view.
  useEffect(() => {
    if (!selectedPR) return
    const raf = requestAnimationFrame(() => {
      document.getElementById(`pr-${selectedPR.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(raf)
  }, [selectedPR?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectDetail(pr: GitHubPR) {
    setSelectedPR(pr)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      const d = await fetchPRDetail(token, pr.repo, pr.number)
      setDetail(d)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to load PR details')
    } finally {
      setDetailLoading(false)
    }
  }

  function reset() {
    setSelectedPR(null)
    setDetail(null)
    setDetailError(null)
  }

  return {
    selectedPR,
    detail,
    detailLoading,
    detailError,
    selectDetail,
    reset,
  }
}
