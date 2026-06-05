'use client'

import { useState, useEffect } from 'react'
import { validateToken } from '@/lib/github'
import type { AppView } from '@/types'

const STORAGE_TOKEN = 'gh_pat'
const STORAGE_REPOS = 'gh_repos'

/**
 * Manages application-level auth state and view routing.
 *
 * Reads token + repos from localStorage on the first client render (SSR-safe),
 * validates the stored token to populate currentUser, and provides a handler
 * to persist new settings and switch to the dashboard view.
 */
export function useAppSettings() {
  const [view, setView] = useState<AppView>('loading')
  const [token, setToken] = useState('')
  const [repos, setRepos] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Hydrate from localStorage on initial client mount.
  // Must be an effect — localStorage is not available during SSR.
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN) ?? ''
    const storedRepos = JSON.parse(localStorage.getItem(STORAGE_REPOS) ?? '[]') as string[]

    if (storedToken && storedRepos.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRepos(storedRepos)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView('dashboard')
      validateToken(storedToken)
        .then(u => setCurrentUser(u.login))
        .catch(() => {})
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView('settings')
    }
  }, [])

  function handleSaveSettings(newToken: string, newRepos: string[]) {
    localStorage.setItem(STORAGE_TOKEN, newToken)
    localStorage.setItem(STORAGE_REPOS, JSON.stringify(newRepos))
    setToken(newToken)
    setRepos(newRepos)
    setView('dashboard')
    validateToken(newToken).then(u => setCurrentUser(u.login)).catch(() => {})
  }

  return {
    view,
    token,
    repos,
    currentUser,
    handleSaveSettings,
    openSettings: () => setView('settings'),
  }
}
