"use client"

import { Eye, ExternalLink, QrCode, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function PreviewDropdown({ onPreviewInEditor, onPreviewNewTab }: { onPreviewInEditor: () => void; onPreviewNewTab: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-7 gap-1 text-[13px] font-medium">
          <Eye className="size-3.5" /> Preview <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px]">
        <DropdownMenuItem onClick={onPreviewInEditor} className="flex gap-3 py-3">
          <Eye className="size-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview in Editor</div><div className="text-[11px] text-muted-foreground mt-0.5">Quickly check your site in this tab.</div></div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPreviewNewTab} className="flex gap-3 py-3">
          <ExternalLink className="size-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview in New Tab</div><div className="text-[11px] text-muted-foreground mt-0.5">Open a full preview in another tab.</div></div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Mobile preview coming soon")} className="flex gap-3 py-3">
          <QrCode className="size-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview on Mobile</div><div className="text-[11px] text-muted-foreground mt-0.5">Scan QR code to preview on any device.</div></div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
