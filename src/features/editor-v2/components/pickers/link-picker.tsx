"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Link2 } from "lucide-react"

interface LinkPickerProps {
  value: string
  onChange: (url: string) => void
  pages?: { id: string; name: string; slug: string }[]
}

export function LinkPicker({ value, onChange, pages = [] }: LinkPickerProps) {
  const [open, setOpen] = useState(false)
  const [newTab, setNewTab] = useState(false)
  const [draft, setDraft] = useState("")

  const apply = (url: string) => {
    onChange(newTab ? `${url}|_blank` : url)
    setOpen(false)
    setDraft("")
  }

  return (
    <div className="flex flex-col gap-1.5">
      {value && <span className="text-[10px] text-muted-foreground truncate">{value.replace("|_blank", "")}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs w-full justify-start gap-1.5">
            <Link2 className="h-3 w-3" />{value ? "Change link" : "Pick link"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="w-full rounded-none border-b h-8">
              <TabsTrigger value="page" className="text-[10px] flex-1 h-7">Page</TabsTrigger>
              <TabsTrigger value="url" className="text-[10px] flex-1 h-7">URL</TabsTrigger>
              <TabsTrigger value="email" className="text-[10px] flex-1 h-7">Email</TabsTrigger>
              <TabsTrigger value="phone" className="text-[10px] flex-1 h-7">Phone</TabsTrigger>
            </TabsList>
            <div className="p-2 flex flex-col gap-2">
              <TabsContent value="page" className="m-0">
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {pages.map((p) => (
                    <button key={p.id} onClick={() => apply(p.slug)} className="w-full text-left text-xs px-2 py-1 rounded hover:bg-muted truncate">{p.name}</button>
                  ))}
                  {pages.length === 0 && <p className="text-[10px] text-muted-foreground p-1">No pages available</p>}
                </div>
              </TabsContent>
              <TabsContent value="url" className="m-0 flex flex-col gap-1.5">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://…" className="h-7 text-xs" />
                <Button size="sm" className="h-7 text-xs" onClick={() => draft && apply(draft)}>Apply</Button>
              </TabsContent>
              <TabsContent value="email" className="m-0 flex flex-col gap-1.5">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="user@example.com" type="email" className="h-7 text-xs" />
                <Button size="sm" className="h-7 text-xs" onClick={() => draft && apply(`mailto:${draft}`)}>Apply</Button>
              </TabsContent>
              <TabsContent value="phone" className="m-0 flex flex-col gap-1.5">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="+1 555 000 0000" type="tel" className="h-7 text-xs" />
                <Button size="sm" className="h-7 text-xs" onClick={() => draft && apply(`tel:${draft}`)}>Apply</Button>
              </TabsContent>
              <label className="flex items-center gap-1.5 px-1">
                <Checkbox checked={newTab} onCheckedChange={(c) => setNewTab(c === true)} className="h-3 w-3" />
                <span className="text-[10px] text-muted-foreground">Open in new tab</span>
              </label>
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  )
}
