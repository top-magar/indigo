"use client"

import { ReactNode, SyntheticEvent } from "react"
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Copy,
  Trash2,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BlockActionBarProps {
  label?: string
  children?: ReactNode
  className?: string
  position?: "top" | "bottom" | "left" | "right"
}

export function BlockActionBar({
  label,
  children,
  className,
  position = "top",
}: BlockActionBarProps) {
  const positionClasses = {
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-full flex-row",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full flex-row",
    left: "left-0 top-1/2 -translate-x-full -translate-y-1/2 flex-col",
    right: "right-0 top-1/2 translate-x-full -translate-y-1/2 flex-col",
  }

  return (
    <div
      className={cn(
        "absolute z-50 flex items-center gap-0.5 p-1",
        "bg-popover border rounded-lg shadow-lg",
        positionClasses[position],
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-r mr-1">
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

interface ActionProps {
  children: ReactNode
  label?: string
  onClick: (e: SyntheticEvent) => void
  active?: boolean
  disabled?: boolean
  variant?: "default" | "danger"
}

export function Action({
  children,
  label,
  onClick,
  active = false,
  disabled = false,
  variant = "default",
}: ActionProps) {
  return (
    <button
      type="button"
      className={cn(
        "p-1.5 rounded transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "default" && [
          "hover:bg-accent",
          active && "bg-accent text-accent-foreground",
        ],
        variant === "danger" && "hover:bg-destructive hover:text-destructive-foreground"
      )}
      onClick={onClick}
      title={label}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

export function Separator() {
  return <div className="w-px h-5 bg-border mx-1" />
}

// Pre-built action components
interface BlockActionsProps {
  onMoveUp?: () => void
  onMoveDown?: () => void
  onAddBelow?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  showDragHandle?: boolean
}

export function BlockActions({
  onMoveUp,
  onMoveDown,
  onAddBelow,
  onDuplicate,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  showDragHandle = false,
}: BlockActionsProps) {
  const iconSize = 16

  return (
    <>
      {showDragHandle && (
        <Group>
          <div className="p-1.5 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical size={iconSize} />
          </div>
          <Separator />
        </Group>
      )}

      {(onMoveUp || onMoveDown) && (
        <Group>
          {onMoveUp && (
            <Action
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              label="Move Up"
              disabled={!canMoveUp}
            >
              <ChevronUp size={iconSize} />
            </Action>
          )}
          {onMoveDown && (
            <Action
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              label="Move Down"
              disabled={!canMoveDown}
            >
              <ChevronDown size={iconSize} />
            </Action>
          )}
        </Group>
      )}

      {onAddBelow && (
        <>
          <Separator />
          <Action
            onClick={(e) => {
              e.stopPropagation()
              onAddBelow()
            }}
            label="Add Block Below"
          >
            <Plus size={iconSize} />
          </Action>
        </>
      )}

      {onDuplicate && (
        <>
          <Separator />
          <Action
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            label="Duplicate"
          >
            <Copy size={iconSize} />
          </Action>
        </>
      )}

      {onDelete && (
        <>
          <Separator />
          <Action
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            label="Delete"
            variant="danger"
          >
            <Trash2 size={iconSize} />
          </Action>
        </>
      )}
    </>
  )
}

// Attach sub-components
BlockActionBar.Action = Action
BlockActionBar.Group = Group
BlockActionBar.Separator = Separator
BlockActionBar.BlockActions = BlockActions
