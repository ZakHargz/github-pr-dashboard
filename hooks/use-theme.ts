'use client'

import { useSyncExternalStore } from 'react'

/**
 * Subscribes to the `<html>` element's class list via MutationObserver so the
 * component re-renders whenever the theme changes — including changes driven by
 * the initial blocking FOUC-prevention script in layout.tsx.
 *
 * Uses useSyncExternalStore to avoid tearing and to provide a safe server
 * snapshot (false = light) that prevents hydration mismatches.
 */
export function useTheme() {
  const isDark = useSyncExternalStore(
    (callback) => {
      if (typeof document === 'undefined') return () => {}
      const observer = new MutationObserver(callback)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      return () => observer.disconnect()
    },
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    () => false,
  )

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
