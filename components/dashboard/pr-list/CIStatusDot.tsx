'use client'

import type { CIStatus } from '@/lib/github'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const CI_COLOUR: Record<CIStatus, string> = {
  success: 'bg-green-500',
  failure: 'bg-red-500',
  pending: 'bg-yellow-400 animate-pulse',
  neutral: 'bg-muted-foreground/40',
}

const CI_LABEL: Record<CIStatus, string> = {
  success: 'CI passing',
  failure: 'CI failing',
  pending: 'CI running',
  neutral: 'CI skipped / neutral',
}

interface CIStatusDotProps {
  status: CIStatus | null | undefined
}

/** Coloured dot with a tooltip describing the current CI state. */
export function CIStatusDot({ status }: CIStatusDotProps) {
  if (status == null) return <span className="w-2 shrink-0" />
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex cursor-default bg-transparent border-0 p-0 outline-none">
        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${CI_COLOUR[status]}`} />
      </TooltipTrigger>
      <TooltipContent>{CI_LABEL[status]}</TooltipContent>
    </Tooltip>
  )
}
