"use client"

import { useState, useTransition, useEffect } from "react"
import { PanelTop, PanelBottom } from "lucide-react"
import { saveGlobalSectionsAction, getGlobalSectionsAction } from "../actions"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorContext } from "../editor-context"

export function GlobalSectionsPanel() {
  const { tenantId } = useEditorContext()
  const [headerEnabled, setHeaderEnabled] = useState(false)
  const [footerEnabled, setFooterEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    getGlobalSectionsAction(tenantId).then((r) => { if (r.success) { setHeaderEnabled(r.headerEnabled); setFooterEnabled(r.footerEnabled) }; setLoaded(true) })
  }, [tenantId])

  const handleSave = () => {
    startSave(async () => {
      const r = await saveGlobalSectionsAction(tenantId, { headerEnabled, footerEnabled })
      if (r.success) toast.success("Global sections saved")
      else toast.error(r.error || "Failed to save")
    })
  }

  if (!loaded) return null

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between p-3 rounded border border-border">
        <div className="flex items-center gap-2">
          <PanelTop className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">Global Header</p>
            <p className="text-[11px] text-muted-foreground">Navigation bar on all pages</p>
          </div>
        </div>
        <Switch checked={headerEnabled} onCheckedChange={setHeaderEnabled} />
      </div>

      <div className="flex items-center justify-between p-3 rounded border border-border">
        <div className="flex items-center gap-2">
          <PanelBottom className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">Global Footer</p>
            <p className="text-[11px] text-muted-foreground">Footer links on all pages</p>
          </div>
        </div>
        <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} />
      </div>

      <p className="text-[11px] leading-4 text-muted-foreground">
        When enabled, the header and footer appear on all pages including products and checkout.
      </p>

      <Button onClick={handleSave} disabled={saving} className="w-full h-8 text-[13px]">
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  )
}
