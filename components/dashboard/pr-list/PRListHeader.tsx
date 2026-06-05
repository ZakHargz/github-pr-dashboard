'use client'

import { useTheme } from '@/hooks/use-theme'
import { timeAgo } from '@/lib/date'
import {
  ClockIcon, RefreshIcon, GearIcon,
  SunIcon, MoonIcon, SearchIcon, PersonIcon,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface PRListHeaderProps {
  prCount: number
  displayedCount: number
  loading: boolean
  lastRefreshed: Date | null
  autoRefresh: boolean
  searchText: string
  filterMine: boolean
  currentUser: string | null
  onToggleAutoRefresh: () => void
  onRefresh: () => void
  onSettings: () => void
  onSearchChange: (text: string) => void
  onToggleFilterMine: () => void
}

/** Sidebar header: title, action buttons, status bar, and filter controls. */
export function PRListHeader({
  prCount, displayedCount, loading, lastRefreshed,
  autoRefresh, searchText, filterMine, currentUser,
  onToggleAutoRefresh, onRefresh, onSettings,
  onSearchChange, onToggleFilterMine,
}: PRListHeaderProps) {
  const { isDark, toggle: toggleTheme } = useTheme()

  return (
    <div className="border-b border-border bg-muted/40">
      {/* Title + action buttons */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold">
          Open PRs
          {prCount > 0 && (
            <span className="ml-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              {displayedCount}{displayedCount !== prCount && `/${prCount}`}
            </span>
          )}
        </span>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon-sm"
            title={autoRefresh ? 'Auto-refresh on — click to disable' : 'Auto-refresh off — click to enable (5 min)'}
            onClick={onToggleAutoRefresh}
            className={autoRefresh ? 'text-primary hover:text-primary' : ''}
          >
            <ClockIcon spinning={loading && autoRefresh} />
          </Button>

          <Button
            variant="ghost" size="icon-sm"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>

          <Button variant="ghost" size="icon-sm" title="Refresh now" onClick={onRefresh} disabled={loading}>
            <RefreshIcon className={loading && !autoRefresh ? 'animate-spin' : ''} />
          </Button>

          <Button variant="ghost" size="icon-sm" title="Settings" onClick={onSettings}>
            <GearIcon />
          </Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-3 pb-1.5 flex items-center gap-1.5 min-h-5">
        {loading && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Refreshing…
          </span>
        )}
        {!loading && lastRefreshed && (
          <span className="text-xs text-muted-foreground">
            Updated {timeAgo(lastRefreshed.toISOString())}
          </span>
        )}
        {autoRefresh && (
          <Badge variant="default" className="ml-auto text-[10px] h-4 px-1.5">Auto</Badge>
        )}
      </div>

      {/* Filter bar */}
      <div className="px-2 pb-2 flex items-center gap-1.5">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchText}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search PRs…"
            className="w-full pl-6 pr-2 py-1 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
          />
        </div>

        {/* "Needs my review" toggle — only shown when we know who the user is */}
        {currentUser && (
          <Tooltip>
            <TooltipTrigger
              onClick={onToggleFilterMine}
              aria-pressed={filterMine}
              className={`shrink-0 p-1 rounded-md border transition-colors text-xs ${
                filterMine
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <PersonIcon />
            </TooltipTrigger>
            <TooltipContent>
              {filterMine ? 'Showing: needs my review' : 'Filter: needs my review'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
