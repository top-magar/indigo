"use client"

import { useEditorStore } from "../../store"
import { SectionLabel } from "../ui-primitives"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PanelTop, PanelBottom, Lock, Image, Type, BarChart3 } from "lucide-react"

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1"><Icon className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{label}</span></div>
      {children}
    </div>
  )
}

export function SiteSettingsPanel() {
  const theme = useEditorStore(s => s.theme)
  const updateTheme = useEditorStore(s => s.updateTheme)
  const locales = useEditorStore(s => s.locales)

  const g = (k: string, d: string | number | boolean) => (theme[k] ?? d) as typeof d

  return (
    <div className="flex flex-col gap-3 p-3">
      <SectionLabel>General</SectionLabel>
      <Row icon={PanelTop} label="Header"><Switch checked={g("headerEnabled", true) as boolean} onCheckedChange={(v) => updateTheme({ headerEnabled: v })} /></Row>
      <Row icon={PanelBottom} label="Footer"><Switch checked={g("footerEnabled", true) as boolean} onCheckedChange={(v) => updateTheme({ footerEnabled: v })} /></Row>
      <Row icon={Lock} label="Password"><Switch checked={g("passwordProtected", false) as boolean} onCheckedChange={(v) => updateTheme({ passwordProtected: v })} /></Row>
      {g("passwordProtected", false) && (
        <Input value={g("sitePassword", "") as string} onChange={(e) => updateTheme({ sitePassword: e.target.value })} placeholder="Site password" className="h-6 text-[10px]" />
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1"><Image className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Favicon</span></div>
        <Input value={g("faviconUrl", "") as string} onChange={(e) => updateTheme({ faviconUrl: e.target.value })} placeholder="https://…/favicon.ico" className="h-6 text-[10px]" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1"><Type className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Languages</span></div>
        <Input value={(g("locales", "") as string) || locales.join(", ")} onChange={(e) => updateTheme({ locales: e.target.value })} placeholder="en, es, fr" className="h-6 text-[10px]" />
      </div>

      <div className="border-t border-border/20 pt-3" />
      <SectionLabel>Integrations</SectionLabel>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Google Analytics</span>
        <Input value={g("gaId", "") as string} onChange={(e) => updateTheme({ gaId: e.target.value })} placeholder="G-XXXXXXXXXX" className="h-6 text-[10px] font-mono" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Facebook Pixel</span>
        <Input value={g("fbPixelId", "") as string} onChange={(e) => updateTheme({ fbPixelId: e.target.value })} placeholder="Pixel ID" className="h-6 text-[10px] font-mono" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Form Webhook</span>
        <Input value={g("formWebhookUrl", "") as string} onChange={(e) => updateTheme({ formWebhookUrl: e.target.value })} placeholder="https://hooks.zapier.com/…" className="h-6 text-[10px] font-mono" />
      </div>
      <Row icon={BarChart3} label="Cookie Consent"><Switch checked={g("cookieConsent", false) as boolean} onCheckedChange={(v) => updateTheme({ cookieConsent: v })} /></Row>
      {g("cookieConsent", false) && (
        <Textarea value={g("cookieText", "We use cookies to improve your experience.") as string} onChange={(e) => updateTheme({ cookieText: e.target.value })} className="text-[10px] min-h-[40px] resize-y" />
      )}

      <div className="border-t border-border/20 pt-3" />
      <SectionLabel>Custom Code</SectionLabel>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Head</span>
        <Textarea value={g("headCode", "") as string} onChange={(e) => updateTheme({ headCode: e.target.value })} placeholder="<script>…</script>" className="text-[10px] font-mono min-h-[48px] resize-y" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Body</span>
        <Textarea value={g("bodyCode", "") as string} onChange={(e) => updateTheme({ bodyCode: e.target.value })} placeholder="<script>…</script>" className="text-[10px] font-mono min-h-[48px] resize-y" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Redirects</span>
        <Textarea value={g("redirects", "") as string} onChange={(e) => updateTheme({ redirects: e.target.value })} placeholder={"/old → /new"} className="text-[10px] font-mono min-h-[48px] resize-y" />
        <span className="text-[9px] text-muted-foreground/50">One per line: /from → /to</span>
      </div>
    </div>
  )
}
