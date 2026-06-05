'use client'

import { useAppSettings } from '@/hooks/use-app-settings'
import Dashboard from '@/components/dashboard/Dashboard'
import Settings from '@/components/settings/Settings'

export default function HomePage() {
  const { view, token, repos, currentUser, handleSaveSettings, openSettings } = useAppSettings()

  if (view === 'loading') {
    return <div className="h-screen bg-background" />
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen flex items-start justify-center pt-20 bg-muted/30">
        <Settings token={token} repos={repos} onSave={handleSaveSettings} />
      </div>
    )
  }

  return (
    <Dashboard
      token={token}
      repos={repos}
      currentUser={currentUser}
      onSettings={openSettings}
    />
  )
}
