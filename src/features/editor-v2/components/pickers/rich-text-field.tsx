"use client"

import { useRef, useCallback } from "react"
import { Bold, Italic, Underline, Link, List, ListOrdered, RemoveFormatting } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ToolbarSeparator } from "../ui-primitives"

function ToolBtn({ icon: Icon, cmd, active, tip }: { icon: React.ComponentType<{ className?: string }>; cmd: string; active?: boolean; tip: string }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd, false) }}
        className={`h-6 w-6 flex items-center justify-center rounded transition-colors ${active ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}
      >
        <Icon className="h-3 w-3" />
      </button>
    </TooltipTrigger><TooltipContent className="text-[9px]">{tip}</TooltipContent></Tooltip>
  )
}

export function RichTextField({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleInput = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML)
  }, [onChange])

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:")
    if (url) document.execCommand("createLink", false, url)
    handleInput()
  }, [handleInput])

  return (
    <div className="flex flex-col gap-1 border border-border/30 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 bg-white/5 border-b border-border/20">
        <ToolBtn icon={Bold} cmd="bold" tip="Bold (⌘B)" />
        <ToolBtn icon={Italic} cmd="italic" tip="Italic (⌘I)" />
        <ToolBtn icon={Underline} cmd="underline" tip="Underline (⌘U)" />
        <ToolbarSeparator className="bg-border/20 mx-0.5" />
        <ToolBtn icon={List} cmd="insertUnorderedList" tip="Bullet list" />
        <ToolBtn icon={ListOrdered} cmd="insertOrderedList" tip="Numbered list" />
        <ToolbarSeparator className="bg-border/20 mx-0.5" />
        <Tooltip><TooltipTrigger asChild>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleLink() }} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-white/10">
            <Link className="h-3 w-3" />
          </button>
        </TooltipTrigger><TooltipContent className="text-[9px]">Insert link</TooltipContent></Tooltip>
        <ToolBtn icon={RemoveFormatting} cmd="removeFormat" tip="Clear formatting" />
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[80px] px-2 py-1.5 text-xs outline-none prose prose-sm prose-invert max-w-none [&_a]:text-blue-400 [&_a]:underline"
      />
    </div>
  )
}
