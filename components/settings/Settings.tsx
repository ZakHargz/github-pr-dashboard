'use client'

import { useState } from 'react'
import { validateToken, type GitHubUser } from '@/lib/github'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface SettingsProps {
  token: string
  repos: string[]
  onSave: (token: string, repos: string[]) => void
}

export default function Settings({ token: initialToken, repos: initialRepos, onSave }: SettingsProps) {
  const [token, setToken] = useState(initialToken)
  const [repoInput, setRepoInput] = useState(initialRepos.join('\n'))
  const [validating, setValidating] = useState(false)
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleValidate() {
    setValidating(true)
    setError(null)
    setUser(null)
    try {
      const u = await validateToken(token.trim())
      setUser(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Token validation failed')
    } finally {
      setValidating(false)
    }
  }

  function handleSave() {
    const repos = repoInput
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0 && r.includes('/'))
    onSave(token.trim(), repos)
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-1">GitHub PR Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Configure your Personal Access Token and the repos you want to track.
      </p>

      {/* Token */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Personal Access Token
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Needs <code className="bg-muted px-1 rounded">repo</code> scope (or{' '}
          <code className="bg-muted px-1 rounded">public_repo</code> for public repos only).
          Stored in your browser&apos;s localStorage.
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            value={token}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setToken(e.target.value)
              setUser(null)
              setError(null)
            }}
            placeholder="ghp_..."
            className="flex-1 font-mono"
          />
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={!token.trim() || validating}
          >
            {validating ? 'Checking…' : 'Validate'}
          </Button>
        </div>
        {user && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-full" />
            Authenticated as <span className="font-medium">{user.login}</span>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Repos */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">
          Repositories
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          One per line in <code className="bg-muted px-1 rounded">owner/repo</code> format.
        </p>
        <Textarea
          value={repoInput}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRepoInput(e.target.value)}
          placeholder={'vercel/next.js\nfacebook/react'}
          rows={6}
          className="font-mono resize-y"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!token.trim()}
        className="w-full"
      >
        Save &amp; Load Dashboard
      </Button>
    </div>
  )
}
