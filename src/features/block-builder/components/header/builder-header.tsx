"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, Tablet, Smartphone, Save, Globe, ExternalLink, ArrowLeft } from "lucide-react"
import { useBuilderStore } from "../../hooks/use-builder-store"

interface BuilderHeaderProps {
  storeName: string
  storeSlug: string
}

export function BuilderHeader({ storeName, storeSlug }: BuilderHeaderProps) {
  const {
    document,
    viewport,
    saveStatus,
    isDirty,
    lastSavedAt,
    setViewport,
    save,
    publish,
  } = useBuilderStore()

  const handlePreview = () => {
    const previewUrl = `/store/${storeSlug}?preview=true`
    window.open(previewUrl, '_blank')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left - Back button and Store info */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="font-semibold text-sm">{storeName}</h1>
          <p className="text-xs text-muted-foreground">Block Builder</p>
        </div>
        {document?.metadata.status === "published" && (
          <Badge variant="secondary" className="text-xs">
            Published
          </Badge>
        )}
        {isDirty && (
          <Badge variant="outline" className="text-xs">
            Unsaved changes
          </Badge>
        )}
      </div>

      {/* Center - Viewport switcher */}
      <div className="flex items-center gap-1 rounded-xl border p-1">
        <Button
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("desktop")}
          className="h-7 w-7 p-0"
        >
          <Monitor className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={viewport === "tablet" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("tablet")}
          className="h-7 w-7 p-0"
        >
          <Tablet className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("mobile")}
          className="h-7 w-7 p-0"
        >
          <Smartphone className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Save status */}
        {lastSavedAt && (
          <span className="text-xs text-muted-foreground">
            Saved {lastSavedAt.toLocaleTimeString()}
          </span>
        )}

        {/* Preview button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="gap-2"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Preview
        </Button>

        {/* Save button */}
        <Button
          variant="outline"
          size="sm"
          onClick={save}
          disabled={!isDirty || saveStatus === "saving"}
          className="gap-2"
        >
          <Save className="h-3.5 w-3.5" />
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </Button>

        {/* Publish button */}
        <Button
          size="sm"
          onClick={publish}
          disabled={saveStatus === "saving"}
          className="gap-2"
        >
          <Globe className="h-3.5 w-3.5" />
          {saveStatus === "saving" ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </header>
  )
}