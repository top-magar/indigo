"use client";

import { useState } from "react";
import { Plus, Trash2, MoreHorizontal, MapPin, Clock, Package, Edit, Loader2, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/shared/utils";
import { toast } from "sonner";
import { ZoneDialog, RateDialog } from "./_components/helpers";

interface ShippingRate {
  id: string; name: string; price: number; min_days: number; max_days: number;
  condition_type?: "weight" | "price" | "none"; condition_min?: number; condition_max?: number;
}

interface ShippingZone {
  id: string; name: string; regions: string[]; rates: ShippingRate[];
}

interface ShippingData {
  zones: ShippingZone[];
  freeShippingThreshold: number | null;
  defaultHandlingTime: number;
  carriers: unknown[];
  packages: unknown[];
}

export function ShippingSettingsClient({ data, currency }: { data: ShippingData; currency: string }) {
  const [zones, setZones] = useState(data.zones);
  const [freeShipping, setFreeShipping] = useState(!!data.freeShippingThreshold);
  const [threshold, setThreshold] = useState(data.freeShippingThreshold?.toString() || "2500");
  const [handlingTime, setHandlingTime] = useState(data.defaultHandlingTime.toString());

  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [selectedZoneForRate, setSelectedZoneForRate] = useState<string | null>(null);

  const handleSaveZone = (zoneData: Partial<ShippingZone>) => {
    if (selectedZone) {
      setZones(zones.map(z => z.id === selectedZone.id ? { ...z, ...zoneData } : z));
    } else {
      setZones([...zones, { id: `zone-${Date.now()}`, name: zoneData.name || "", regions: zoneData.regions || [], rates: [] }]);
    }
    setSelectedZone(null);
  };

  const handleSaveRate = (rateData: Partial<ShippingRate>) => {
    if (!selectedZoneForRate) return;
    setZones(zones.map(zone => {
      if (zone.id !== selectedZoneForRate) return zone;
      if (selectedRate) return { ...zone, rates: zone.rates.map(r => r.id === selectedRate.id ? { ...r, ...rateData } : r) };
      return { ...zone, rates: [...zone.rates, { id: `rate-${Date.now()}`, name: rateData.name || "", price: rateData.price || 0, min_days: rateData.min_days || 1, max_days: rateData.max_days || 3, ...rateData }] };
    }));
    setSelectedRate(null);
    setSelectedZoneForRate(null);
  };

  const totalRates = zones.reduce((sum, z) => sum + z.rates.length, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Shipping</h1>
          <p className="text-xs text-muted-foreground">{zones.length} zone{zones.length !== 1 ? "s" : ""} · {totalRates} rate{totalRates !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }} size="sm">
          <Plus className="size-3.5" />
          Add Zone
        </Button>
      </div>

      {/* General Settings */}
      <div>
        <h2 className="text-sm font-medium mb-3">General</h2>
        <div className="rounded-lg border divide-y">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Free Shipping Threshold</p>
              <p className="text-xs text-muted-foreground">Offer free shipping on orders above this amount</p>
            </div>
            <div className="flex items-center gap-2">
              {freeShipping && (
                <Input type="number" min={0} value={threshold} onChange={e => setThreshold(e.target.value)} className="w-28 text-right tabular-nums" />
              )}
              <Switch checked={freeShipping} onCheckedChange={setFreeShipping} />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Handling Time</p>
              <p className="text-xs text-muted-foreground">Days to prepare an order before shipping</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Input type="number" min={0} max={14} value={handlingTime} onChange={e => setHandlingTime(e.target.value)} className="w-16 text-right tabular-nums" />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div>
        <h2 className="text-sm font-medium mb-3">Zones & Rates</h2>
        {zones.length === 0 ? (
          <div className="rounded-lg border p-10 text-center">
            <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Truck className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No shipping zones</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Create zones to define delivery areas and set rates for each</p>
            <Button onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }} size="sm">
              <Plus className="size-3.5" /> Add Zone
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone.id} className="rounded-lg border">
                {/* Zone header */}
                <div className="p-4 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{zone.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{zone.regions.join(", ")}</p>
                  </div>
                  <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">{zone.rates.length} rate{zone.rates.length !== 1 ? "s" : ""}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => { setSelectedZone(zone); setZoneDialogOpen(true); }} className="text-xs gap-2">
                        <Edit className="size-3.5" /> Edit Zone
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }} className="text-xs gap-2">
                        <Plus className="size-3.5" /> Add Rate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setZones(zones.filter(z => z.id !== zone.id)); toast.success("Zone deleted"); }} className="text-xs gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="size-3.5" /> Delete Zone
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Rates */}
                {zone.rates.length > 0 && (
                  <div className="border-t divide-y">
                    {zone.rates.map(rate => (
                      <div key={rate.id} className="px-4 py-2.5 flex items-center gap-3 ml-[52px]">
                        <Package className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1">{rate.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {rate.min_days === rate.max_days ? `${rate.min_days}d` : `${rate.min_days}-${rate.max_days}d`}
                        </span>
                        <span className="text-sm font-medium tabular-nums w-20 text-right">
                          {rate.price === 0 ? "Free" : formatCurrency(rate.price, currency)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(rate); setRateDialogOpen(true); }} className="text-xs gap-2">
                              <Edit className="size-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setZones(zones.map(z => z.id === zone.id ? { ...z, rates: z.rates.filter(r => r.id !== rate.id) } : z)); toast.success("Rate deleted"); }} className="text-xs gap-2 text-destructive focus:text-destructive">
                              <Trash2 className="size-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add rate shortcut */}
                {zone.rates.length === 0 && (
                  <div className="border-t px-4 py-3 ml-[52px]">
                    <button onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      + Add a shipping rate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Customers see available shipping options based on their delivery address and your zone configuration.
      </p>

      <ZoneDialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen} zone={selectedZone} onSave={handleSaveZone} />
      <RateDialog open={rateDialogOpen} onOpenChange={setRateDialogOpen} rate={selectedRate} currency={currency} onSave={handleSaveRate} />
    </div>
  );
}
