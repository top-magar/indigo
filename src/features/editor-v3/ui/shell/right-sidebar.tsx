"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Paintbrush, Settings, FileText, Palette, Sparkles, Accessibility, ChevronRight } from "lucide-react"
import { StylePanel } from "../panels/style-panel"
import { SettingsPanel } from "../panels/settings-panel"
import { SeoPanel } from "../panels/seo-panel"
import { TokensPanel } from "../panels/tokens-panel"
import { StylePresetsPanel } from "../panels/style-presets-panel"
import { AccessibilityPanel } from "../panels/accessibility-panel"

function CollapsibleSection({ id, icon: Icon, label, children }: { id: string; icon: typeof FileText; label: string; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen={false} className={`group/${id}`}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-accent/50">
        <span className="flex items-center gap-1.5"><Icon className="size-3" />{label}</span>
        <ChevronRight className={`size-3 transition-transform group-data-[state=open]/${id}:rotate-90`} />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

export function RightSidebar() {
  return (
    <Tabs defaultValue="style" className="w-[300px] border-l flex flex-col !gap-0">
      <TabsList variant="line" className="w-full justify-start rounded-none border-b px-1 h-9 shrink-0">
        <TabsTrigger value="style" className="text-xs gap-1"><Paintbrush className="size-3.5" />Style</TabsTrigger>
        <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="size-3.5" />Settings</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="style" className="mt-0">
          <StylePanel />
          <Separator />
          <CollapsibleSection id="presets" icon={Sparkles} label="Presets"><StylePresetsPanel /></CollapsibleSection>
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <SettingsPanel />
          <Separator />
          <CollapsibleSection id="seo" icon={FileText} label="SEO & Meta"><SeoPanel /></CollapsibleSection>
          <CollapsibleSection id="tokens" icon={Palette} label="Design Tokens"><TokensPanel /></CollapsibleSection>
          <CollapsibleSection id="a11y" icon={Accessibility} label="Accessibility"><AccessibilityPanel /></CollapsibleSection>
        </TabsContent>
      </div>
    </Tabs>
  )
}
