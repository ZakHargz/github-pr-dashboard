'use client'

import type { RepoError } from '@/types'
import { ExternalLinkMini } from '@/components/icons'

interface RepoErrorBannerProps {
  error: RepoError
}

/** Displays a SAML SSO or generic API error for a repository. */
export function RepoErrorBanner({ error }: RepoErrorBannerProps) {
  if (error.isSAML && error.samlOrg) {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 font-mono">{error.repo}</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Token needs SSO authorization for <span className="font-semibold">{error.samlOrg}</span>.
            </p>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:no-underline font-medium"
            >
              Authorize on GitHub <ExternalLinkMini />
            </a>
            <p className="mt-1 text-amber-600 dark:text-amber-600">
              Settings → Tokens → Configure SSO → Authorize
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
      {error.repo && (
        <p className="font-semibold text-destructive font-mono mb-0.5">{error.repo}</p>
      )}
      <p className="text-destructive/80">{error.message}</p>
    </div>
  )
}
