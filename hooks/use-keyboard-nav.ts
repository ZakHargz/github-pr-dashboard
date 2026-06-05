'use client'

import { useEffect } from 'react'
import type { GitHubPR } from '@/lib/github'

interface UseKeyboardNavOptions {
  prs: GitHubPR[]
  selectedPR: GitHubPR | null
  onSelect: (pr: GitHubPR) => void
  onRefresh: () => void
}

/**
 * Attaches global keyboard shortcuts for navigating the PR list:
 *  - j / ArrowDown  — next PR
 *  - k / ArrowUp    — previous PR
 *  - r              — refresh (without Cmd/Ctrl modifier)
 *
 * Guards against firing while focus is inside an input or editable element.
 */
export function useKeyboardNav({ prs, selectedPR, onSelect, onRefresh }: UseKeyboardNavOptions) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      if (prs.length === 0) return

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = selectedPR ? prs.findIndex(p => p.id === selectedPR.id) : -1
        onSelect(prs[(idx + 1) % prs.length])
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = selectedPR ? prs.findIndex(p => p.id === selectedPR.id) : 0
        onSelect(prs[(idx - 1 + prs.length) % prs.length])
      } else if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        onRefresh()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [prs, selectedPR, onSelect, onRefresh])
}
