"use client"

import { useMemo, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Plus,
  Trash2,
  Move,
  Settings,
  Eye,
  Lock,
  Copy,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"

// =============================================================================
// TYPES
// =============================================================================

export interface HistoryEntry {
  id: string
  type: "add" | "remove" | "move" | "update" | "visibility" | "lock" | "duplicate"
  description: string
  timestamp: number
  blockId?: string
  blockType?: string
}

export interface LayersHistoryProps {
  history: HistoryEntry[]
  currentIndex: number
  onJumpToState: (index: number) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACTION_ICONS: Record<HistoryEntry["type"], LucideIcon> = {
  add: Plus,
  remove: Trash2,
  move: Move,
  update: Settings,
  visibility: Eye,
  lock: Lock,
  duplicate: Copy,
}

const ACTION_COLORS: Record<HistoryEntry["type"], string> = {
  add: "text-[var(--ds-green-700)]",
  remove: "text-[var(--ds-red-700)]",
  move: "text-[var(--ds-blue-700)]",
  update: "text-[var(--ds-amber-700)]",
  visibility: "text-[var(--ds-purple-700)]",
  lock: "text-[var(--ds-amber-600)]",
  duplicate: "text-[var(--ds-teal-700)]",
}

const MAX_HISTORY_DISPLAY = 15

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  // Less than a minute
  if (diff < 60000) {
    return "Just now"
  }

  // Less than an hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Format as date
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

// =============================================================================
// HISTORY ITEM COMPONENT
// =============================================================================

interface HistoryItemProps {
  entry: HistoryEntry
  isCurrent: boolean
  isInPast: boolean
  onClick: () => void
}

function HistoryItem({ entry, isCurrent, isInPast, onClick }: HistoryItemProps) {
  const Icon = ACTION_ICONS[entry.type]
  const iconColor = ACTION_COLORS[entry.type]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-sm transition-colors",
            "hover:bg-muted/50",
            isCurrent && "bg-[var(--ds-purple-700)]/10 border border-[var(--ds-purple-700)]/20",
            isInPast && !isCurrent && "opacity-50"
          )}
        >
          {/* State indicator */}
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            isCurrent ? "bg-[var(--ds-purple-700)]" : isInPast ? "bg-muted-foreground/30" : "bg-muted-foreground/50"
          )} />

          {/* Icon */}
          <Icon className={cn("h-3 w-3 shrink-0", isCurrent ? iconColor : "text-muted-foreground")} />

          {/* Description */}
          <span className={cn(
            "flex-1 text-xs truncate",
            isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {entry.description}
          </span>

          {/* Current indicator */}
          {isCurrent && (
            <Check className="h-3 w-3 text-[var(--ds-purple-700)] shrink-0" />
          )}

          {/* Timestamp */}
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatTimestamp(entry.timestamp)}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{entry.description}</span>
          {entry.blockType && (
            <span className="text-muted-foreground">Block: {entry.blockType}</span>
          )}
          <span className="text-muted-foreground">
            Click to {isInPast ? "redo to" : isCurrent ? "current state" : "undo to"} this state
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LayersHistory({
  history,
  currentIndex,
  onJumpToState,
  isCollapsed = false,
  onToggleCollapse,
}: LayersHistoryProps) {
  // Get visible history entries (last N entries)
  const visibleHistory = useMemo(() => {
    return history.slice(-MAX_HISTORY_DISPLAY)
  }, [history])

  // Calculate offset for index mapping
  const indexOffset = useMemo(() => {
    return Math.max(0, history.length - MAX_HISTORY_DISPLAY)
  }, [history])

  // Handle jump to state
  const handleJumpToState = useCallback((visibleIndex: number) => {
    const actualIndex = visibleIndex + indexOffset
    onJumpToState(actualIndex)
  }, [onJumpToState, indexOffset])

  // Check if we can undo/redo
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  // Quick undo/redo handlers
  const handleUndo = useCallback(() => {
    if (canUndo) {
      onJumpToState(currentIndex - 1)
    }
  }, [canUndo, currentIndex, onJumpToState])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      onJumpToState(currentIndex + 1)
    }
  }, [canRedo, currentIndex, onJumpToState])

  // Empty state
  if (history.length === 0) {
    return (
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse?.()}>
        <div className="border-t">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">History</span>
              </div>
              <ChevronDown className={cn("h-3 w-3 text-muted-foreground", isCollapsed && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-muted-foreground">No history yet</p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse?.()}>
      <div className="border-t">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">History</span>
              <span className="text-[10px] text-muted-foreground">
                ({currentIndex + 1}/{history.length})
              </span>
            </div>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground", isCollapsed && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Quick undo/redo buttons */}
          <div className="flex items-center gap-1 px-2 pb-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Undo (⌘Z)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Redo (⇧⌘Z)
              </TooltipContent>
            </Tooltip>

            <span className="flex-1" />

            {history.length > MAX_HISTORY_DISPLAY && (
              <span className="text-[10px] text-muted-foreground">
                +{history.length - MAX_HISTORY_DISPLAY} older
              </span>
            )}
          </div>

          {/* Timeline */}
          <ScrollArea className="max-h-48">
            <div className="px-1.5 pb-1.5 space-y-0.5">
              {visibleHistory.map((entry, visibleIndex) => {
                const actualIndex = visibleIndex + indexOffset
                const isCurrent = actualIndex === currentIndex
                const isInPast = actualIndex < currentIndex

                return (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    isCurrent={isCurrent}
                    isInPast={isInPast}
                    onClick={() => handleJumpToState(visibleIndex)}
                  />
                )
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
