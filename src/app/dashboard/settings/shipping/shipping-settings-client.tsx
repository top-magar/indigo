"use client";

import { useState } from "react";
import {
    Truck,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    MapPin,
    Clock,
    CheckCircle,
    Package,
    Globe,
    Settings,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/shared/utils";
import { toast } from "sonner";
import { getCurrencySymbol, ZoneDialog, RateDialog, mockCarriers } from "./_components/helpers";

// ============================================================================
// TYPES
// ============================================================================

interface ShippingRate {
    id: string;
    name: string;
    price: number;
    min_days: number;
    max_days: number;
    condition_type?: "weight" | "price" | "none";
    condition_min?: number;
    condition_max?: number;
}

interface ShippingZone {
    id: string;
    name: string;
    regions: string[];
    rates: ShippingRate[];
}

interface CarrierIntegration {
    id: string;
    name: string;
    logo: string;
    connected: boolean;
    services: string[];
}

interface PackageDimension {
    id: string;
    name: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    is_default: boolean;
}

interface ShippingData {
    zones: ShippingZone[];
    freeShippingThreshold: number | null;
    defaultHandlingTime: number;
    carriers: CarrierIntegration[];
    packages: PackageDimension[];
}

interface ShippingSettingsClientProps {
    data: ShippingData;
    currency: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function ShippingSettingsClient({ data, currency }: ShippingSettingsClientProps) {
    const [freeShippingEnabled, setFreeShippingEnabled] = useState(!!data.freeShippingThreshold);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(
        data.freeShippingThreshold?.toString() || "2500"
    );
    const [handlingTime, setHandlingTime] = useState(data.defaultHandlingTime.toString());
    
    // Dialog states
    const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
    const [rateDialogOpen, setRateDialogOpen] = useState(false);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
    const [selectedZoneForRate, setSelectedZoneForRate] = useState<string | null>(null);

    // Local state for zones (in production, this would be server state)
    const [zones, setZones] = useState<ShippingZone[]>(data.zones);
    const [carriers] = useState<CarrierIntegration[]>(mockCarriers);

    const handleSaveGeneralSettings = () => {
        toast.success("Shipping settings saved");
    };

    const handleSaveZone = (zoneData: Partial<ShippingZone>) => {
        if (selectedZone) {
            setZones(zones.map(z => z.id === selectedZone.id ? { ...z, ...zoneData } : z));
        } else {
            const newZone: ShippingZone = {
                id: `zone-${Date.now()}`,
                name: zoneData.name || "",
                regions: zoneData.regions || [],
                rates: [],
            };
            setZones([...zones, newZone]);
        }
        setSelectedZone(null);
    };

    const handleSaveRate = (rateData: Partial<ShippingRate>) => {
        if (!selectedZoneForRate) return;
        
        setZones(zones.map(zone => {
            if (zone.id !== selectedZoneForRate) return zone;
            
            if (selectedRate) {
                return {
                    ...zone,
                    rates: zone.rates.map(r => r.id === selectedRate.id ? { ...r, ...rateData } : r),
                };
            } else {
                const newRate: ShippingRate = {
                    id: `rate-${Date.now()}`,
                    name: rateData.name || "",
                    price: rateData.price || 0,
                    min_days: rateData.min_days || 1,
                    max_days: rateData.max_days || 3,
                    condition_type: rateData.condition_type,
                    condition_min: rateData.condition_min,
                    condition_max: rateData.condition_max,
                };
                return { ...zone, rates: [...zone.rates, newRate] };
            }
        }));
        setSelectedRate(null);
        setSelectedZoneForRate(null);
    };

    const handleDeleteZone = (zoneId: string) => {
        setZones(zones.filter(z => z.id !== zoneId));
        toast.success("Zone deleted");
    };

    const handleDeleteRate = (zoneId: string, rateId: string) => {
        setZones(zones.map(zone => {
            if (zone.id !== zoneId) return zone;
            return { ...zone, rates: zone.rates.filter(r => r.id !== rateId) };
        }));
        toast.success("Rate deleted");
    };

    const handleConnectCarrier = (carrierId: string) => {
        toast.info("Carrier integration coming soon");
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div>
                <h2 className="text-sm font-semibold">Shipping</h2>
                <p className="text-sm text-muted-foreground">
                    Configure shipping zones, rates, and delivery options
                </p>
            </div>

            <Tabs defaultValue="zones" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="zones" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Zones & Rates
                    </TabsTrigger>
                    <TabsTrigger value="carriers" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Carriers
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Zones & Rates Tab */}
                <TabsContent value="zones" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm">Shipping Zones</CardTitle>
                                <CardDescription>
                                    Define regions and set shipping rates for each zone
                                </CardDescription>
                            </div>
                            <Button onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Zone
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {zones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 mb-3">
                                        <Truck className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-medium mb-1">No shipping zones</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create shipping zones to define delivery areas and rates
                                    </p>
                                    <Button onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Zone
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {zones.map((zone) => (
                                        <div
                                            key={zone.id}
                                            className="rounded-lg border bg-card p-4 space-y-4"
                                        >
                                            {/* Zone Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium">{zone.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {zone.regions.join(", ")}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm" aria-label="More actions">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedZone(zone); setZoneDialogOpen(true); }}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Zone
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }}>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Rate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteZone(zone.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete Zone
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Rates */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Shipping Rates
                                                    </p>
                                                    <Button
                                                        variant="ghost" 
                                                        className="h-7 text-xs"
                                                        onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add Rate
                                                    </Button>
                                                </div>
                                                {zone.rates.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                                        No rates configured for this zone
                                                    </p>
                                                ) : (
                                                    <div className="grid gap-2">
                                                        {zone.rates.map((rate) => (
                                                            <div
                                                                key={rate.id}
                                                                className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border">
                                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">{rate.name}</p>
                                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            {rate.min_days === rate.max_days 
                                                                                ? `${rate.min_days} day${rate.min_days !== 1 ? "s" : ""}`
                                                                                : `${rate.min_days}-${rate.max_days} days`
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className="font-mono">
                                                                        {rate.price === 0 ? "Free" : formatCurrency(rate.price, currency)}
                                                                    </Badge>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon-xs">
                                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(rate); setRateDialogOpen(true); }}>
                                                                                <Edit className="h-4 w-4 mr-2" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem 
                                                                                className="text-destructive focus:text-destructive"
                                                                                onClick={() => handleDeleteRate(zone.id, rate.id)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Carriers Tab */}
                <TabsContent value="carriers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Carrier Integrations</CardTitle>
                            <CardDescription>
                                Connect shipping carriers to get real-time rates and tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {carriers.map((carrier) => (
                                <div
                                    key={carrier.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm">
                                            {carrier.logo}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{carrier.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {carrier.services.join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {carrier.connected ? (
                                            <>
                                                <Badge className="bg-success/10 text-success">
                                                    Connected
                                                </Badge>
                                                <Button variant="outline">
                                                    Configure
                                                </Button>
                                            </>
                                        ) : (
                                            <Button onClick={() => handleConnectCarrier(carrier.id)}>
                                                Connect
                                                <ArrowRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Truck className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Real-time shipping rates</p>
                                    <p className="text-sm text-muted-foreground">
                                        Connect a carrier to automatically calculate shipping costs based on package dimensions and destination.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">General Settings</CardTitle>
                            <CardDescription>
                                Configure default shipping behavior for your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Free Shipping */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Free Shipping Threshold</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Offer free shipping on orders above a certain amount
                                    </p>
                                </div>
                                <Switch
                                    checked={freeShippingEnabled}
                                    onCheckedChange={setFreeShippingEnabled}
                                />
                            </div>
                            {freeShippingEnabled && (
                                <div className="pl-0 space-y-2">
                                    <Label htmlFor="threshold">Minimum Order Amount</Label>
                                    <div className="relative max-w-xs">
                                        <Input
                                            id="threshold"
                                            type="number"
                                            min="0"
                                            value={freeShippingThreshold}
                                            onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                            className="pl-12"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            {getCurrencySymbol(currency)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Handling Time */}
                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="handling">Default Handling Time (days)</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Time needed to prepare an order before shipping
                                </p>
                                <Input
                                    id="handling"
                                    type="number"
                                    min="0"
                                    max="14"
                                    value={handlingTime}
                                    onChange={(e) => setHandlingTime(e.target.value)}
                                    className="max-w-[100px]"
                                />
                            </div>

                            <Button onClick={handleSaveGeneralSettings} className="mt-4">
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Package Dimensions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm">Package Presets</CardTitle>
                                <CardDescription>
                                    Define common package sizes for quick selection
                                </CardDescription>
                            </div>
                            <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Package
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    { name: "Small Box", dimensions: "20 × 15 × 10 cm", weight: "0.5 kg", isDefault: true },
                                    { name: "Medium Box", dimensions: "30 × 25 × 15 cm", weight: "1 kg", isDefault: false },
                                    { name: "Large Box", dimensions: "40 × 35 × 25 cm", weight: "2 kg", isDefault: false },
                                ].map((pkg, i) => (
                                    <div key={i} className="p-3 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{pkg.name}</p>
                                            </div>
                                            {pkg.isDefault && (
                                                <Badge className="text-[10px]">Default</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{pkg.dimensions}</p>
                                        <p className="text-xs text-muted-foreground">Max weight: {pkg.weight}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-success/5 border-success/20">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                                    <CheckCircle className="h-4 w-4 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Shipping rates are calculated at checkout</p>
                                    <p className="text-sm text-muted-foreground">
                                        Customers will see available shipping options based on their delivery address and the zones you've configured.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <ZoneDialog
                open={zoneDialogOpen}
                onOpenChange={setZoneDialogOpen}
                zone={selectedZone}
                onSave={handleSaveZone}
            />
            <RateDialog
                open={rateDialogOpen}
                onOpenChange={setRateDialogOpen}
                rate={selectedRate}
                currency={currency}
                onSave={handleSaveRate}
            />
        </div>
    );
}
