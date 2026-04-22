"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CheckCircle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/shared/utils"
import { getCurrencySymbol } from "@/shared/currency"

type ShippingRate = { id: string; name: string; price: number; min_days: number; max_days: number; condition_type?: "none" | "price" | "weight"; condition_min?: number; condition_max?: number }
type ShippingZone = { id: string; name: string; regions: string[]; rates: ShippingRate[] }

export { getCurrencySymbol }

const REGIONS = [
  { id: "nepal", name: "Nepal (Domestic)", countries: ["All of Nepal"], group: "domestic" },
  { id: "kathmandu_valley", name: "Kathmandu Valley", countries: ["Kathmandu, Lalitpur, Bhaktapur"], group: "domestic" },
  { id: "nepal_hills", name: "Nepal Hills & Terai", countries: ["Outside Kathmandu Valley"], group: "domestic" },
  { id: "nepal_remote", name: "Nepal Remote Areas", countries: ["Mountain districts, restricted areas"], group: "domestic" },
  { id: "south_asia", name: "South Asia", countries: ["India, Bangladesh, Sri Lanka, Pakistan"], group: "international" },
  { id: "middle_east", name: "Middle East", countries: ["UAE, Saudi Arabia, Qatar, Kuwait"], group: "international" },
  { id: "southeast_asia", name: "Southeast Asia", countries: ["Thailand, Vietnam, Malaysia, Singapore"], group: "international" },
  { id: "europe", name: "Europe", countries: ["UK, Germany, France, Italy, Spain"], group: "international" },
  { id: "north_america", name: "North America", countries: ["USA, Canada"], group: "international" },
  { id: "rest_of_world", name: "Rest of World", countries: ["All other countries"], group: "international" },
]

// ─── Zone Dialog ──────────────────────────────────────────

interface ZoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zone: ShippingZone | null
  onSave: (zone: Partial<ShippingZone>) => void
}

export function ZoneDialog({ open, onOpenChange, zone, onSave }: ZoneDialogProps) {
  const isEditing = !!zone
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState("")

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName(zone?.name || "")
      setSelected(zone?.regions || [])
      setSearch("")
    }
  }, [open, zone])

  const toggle = (region: string) =>
    setSelected(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    onSave({ name, regions: selected })
    setSaving(false)
    onOpenChange(false)
    toast.success(isEditing ? "Zone updated" : "Zone created")
  }

  const filtered = search
    ? REGIONS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.countries.some(c => c.toLowerCase().includes(search.toLowerCase())))
    : REGIONS

  const domestic = filtered.filter(r => r.group === "domestic")
  const international = filtered.filter(r => r.group === "international")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Zone" : "Create Shipping Zone"}</DialogTitle>
          <DialogDescription>Define a zone and select the regions it covers.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Zone Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kathmandu Valley, International" autoFocus required />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Regions <span className="text-muted-foreground">({selected.length} selected)</span></Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search regions…" className="pl-8 h-8 text-xs" />
            </div>
            <div className="max-h-[240px] overflow-y-auto rounded-md border divide-y">
              {domestic.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-1.5 bg-muted/30">Domestic</p>
                  {domestic.map(r => (
                    <RegionRow key={r.id} name={r.name} detail={r.countries[0]} selected={selected.includes(r.name)} onToggle={() => toggle(r.name)} />
                  ))}
                </div>
              )}
              {international.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-1.5 bg-muted/30">International</p>
                  {international.map(r => (
                    <RegionRow key={r.id} name={r.name} detail={r.countries[0]} selected={selected.includes(r.name)} onToggle={() => toggle(r.name)} />
                  ))}
                </div>
              )}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No regions match &quot;{search}&quot;</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving || !name || selected.length === 0}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
              {isEditing ? "Save" : "Create Zone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegionRow({ name, detail, selected, onToggle }: { name: string; detail: string; selected: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={cn("flex items-center justify-between w-full px-3 py-2 text-left transition-colors", selected ? "bg-accent" : "hover:bg-accent/50")}>
      <div>
        <p className="text-xs font-medium">{name}</p>
        <p className="text-[10px] text-muted-foreground">{detail}</p>
      </div>
      {selected && <CheckCircle className="size-3.5 text-foreground shrink-0" />}
    </button>
  )
}

// ─── Rate Dialog ──────────────────────────────────────────

interface RateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rate: ShippingRate | null
  currency: string
  onSave: (rate: Partial<ShippingRate>) => void
}

export function RateDialog({ open, onOpenChange, rate, currency, onSave }: RateDialogProps) {
  const isEditing = !!rate
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({ name: "", price: "", min_days: "", max_days: "", condition_type: "none", condition_min: "", condition_max: "" })

  useEffect(() => {
    if (open) {
      setF({
        name: rate?.name || "", price: rate?.price?.toString() || "", min_days: rate?.min_days?.toString() || "",
        max_days: rate?.max_days?.toString() || "", condition_type: rate?.condition_type || "none",
        condition_min: rate?.condition_min?.toString() || "", condition_max: rate?.condition_max?.toString() || "",
      })
    }
  }, [open, rate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    onSave({
      name: f.name, price: parseFloat(f.price), min_days: parseInt(f.min_days), max_days: parseInt(f.max_days),
      condition_type: f.condition_type as ShippingRate["condition_type"],
      condition_min: f.condition_min ? parseFloat(f.condition_min) : undefined,
      condition_max: f.condition_max ? parseFloat(f.condition_max) : undefined,
    })
    setSaving(false)
    onOpenChange(false)
    toast.success(isEditing ? "Rate updated" : "Rate added")
  }

  const sym = getCurrencySymbol(currency)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Rate" : "Add Shipping Rate"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Rate Name</Label>
            <Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Standard, Express" autoFocus required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Price ({sym})</Label>
              <Input type="number" min={0} step={0.01} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} placeholder="0" required className="tabular-nums" />
              <p className="text-[10px] text-muted-foreground">Set to 0 for free shipping</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Delivery Time (days)</Label>
              <div className="flex items-center gap-1.5">
                <Input type="number" min={1} value={f.min_days} onChange={e => setF({ ...f, min_days: e.target.value })} placeholder="1" required className="tabular-nums" />
                <span className="text-xs text-muted-foreground">–</span>
                <Input type="number" min={1} value={f.max_days} onChange={e => setF({ ...f, max_days: e.target.value })} placeholder="3" required className="tabular-nums" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <Label className="text-xs">Condition (optional)</Label>
            <Select value={f.condition_type} onValueChange={(v: "none" | "price" | "weight") => setF({ ...f, condition_type: v })}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No condition</SelectItem>
                <SelectItem value="price">Based on order price</SelectItem>
                <SelectItem value="weight">Based on order weight</SelectItem>
              </SelectContent>
            </Select>
            {f.condition_type !== "none" && (
              <div className="flex items-center gap-1.5">
                <Input type="number" min={0} value={f.condition_min} onChange={e => setF({ ...f, condition_min: e.target.value })} placeholder="Min" className="tabular-nums" />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="number" min={0} value={f.condition_max} onChange={e => setF({ ...f, condition_max: e.target.value })} placeholder="Max" className="tabular-nums" />
                <span className="text-xs text-muted-foreground shrink-0">{f.condition_type === "price" ? sym : "kg"}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Save" : "Add Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
