"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface PanelShellProps {
  title: string
  icon?: LucideIcon
  actions?: ReactNode
  children: ReactNode
  /** Skip ScrollArea — caller manages own scroll */
  noScroll?: boolean
}

export function PanelShell({ title, icon: Icon, actions, children, noScroll }: PanelShellProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1 bg-background">
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        {actions && <div className="ml-auto flex gap-0.5">{actions}</div>}
      </div>
      <Separator />
      {noScroll ? (
        <div className="flex flex-col flex-1 min-h-0">{children}</div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">{children}</ScrollArea>
      )}
    </div>
  )
}
