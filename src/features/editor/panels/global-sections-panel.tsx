"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useEditor } from "@craftjs/core"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Globe, Save } from "lucide-react"
import { toast } from "sonner"
import { saveGlobalSectionsAction, getGlobalSectionsAction } from "../actions/actions"

interface Props { tenantId: string }

export function GlobalSectionsPanel({ tenantId }: Props) {
  const { query } = useEditor()
  const [headerEnabled, setHeaderEnabled] = useState(false)
  const [footerEnabled, setFooterEnabled] = useState(false)
  const [saving, startSave] = useTransition()
  const [loaded, setLoaded] = useState(false)

  // Load current global section state
  useEffect(() => {
    getGlobalSectionsAction(tenantId).then((res) => {
      if (res.success) {
        setHeaderEnabled(res.headerEnabled)
        setFooterEnabled(res.footerEnabled)
      }
      setLoaded(true)
    })
  }, [tenantId])

  const handleSave = useCallback(() => {
    startSave(async () => {
      // Serialize current page's first and last root children as header/footer
      const json = query.serialize()
      const result = await saveGlobalSectionsAction(tenantId, {
        headerEnabled,
        footerEnabled,
        headerJson: headerEnabled ? json : undefined,
        footerJson: footerEnabled ? json : undefined,
      })
      if (result.success) toast.success("Global sections saved")
      else toast.error(result.error)
    })
  }, [tenantId, headerEnabled, footerEnabled, query])

  if (!loaded) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Globe className="size-4" /> Global Sections
      </div>
      <p className="text-xs text-muted-foreground">
        Global sections appear on every page. Edit them here and they update everywhere.
      </p>
      <div className="flex items-center justify-between">
        <Label htmlFor="header-toggle" className="text-sm">Global Header</Label>
        <Switch id="header-toggle" checked={headerEnabled} onCheckedChange={setHeaderEnabled} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="footer-toggle" className="text-sm">Global Footer</Label>
        <Switch id="footer-toggle" checked={footerEnabled} onCheckedChange={setFooterEnabled} />
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save className="size-3.5" /> {saving ? "Saving…" : "Save Global Sections"}
      </Button>
    </div>
  )
}
