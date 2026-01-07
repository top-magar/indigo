"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DeliveryTruck01Icon,
    Add01Icon,
    Edit01Icon,
    Delete01Icon,
    MoreHorizontalIcon,
    Location01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    PackageIcon,
    Globe02Icon,
    Settings01Icon,
    Loading01Icon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
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

function getCurrencySymbol(currency: string) {
    switch (currency) {
        case "USD": return "$";
        case "EUR": return "€";
        case "GBP": return "£";
        case "NPR": return "Rs";
        default: return currency;
    }
}

// Available regions for zone selection
const availableRegions = [
    { id: "domestic", name: "Domestic", countries: ["Nepal"] },
    { id: "south_asia", name: "South Asia", countries: ["India", "Bangladesh", "Sri Lanka", "Pakistan"] },
    { id: "southeast_asia", name: "Southeast Asia", countries: ["Thailand", "Vietnam", "Malaysia", "Singapore"] },
    { id: "middle_east", name: "Middle East", countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait"] },
    { id: "europe", name: "Europe", countries: ["UK", "Germany", "France", "Italy", "Spain"] },
    { id: "north_america", name: "North America", countries: ["USA", "Canada"] },
    { id: "rest_of_world", name: "Rest of World", countries: ["Other countries"] },
];

// Mock carriers
const mockCarriers: CarrierIntegration[] = [
    { id: "nepal_post", name: "Nepal Post", logo: "🇳🇵", connected: false, services: ["Standard", "Express"] },
    { id: "dhl", name: "DHL Express", logo: "📦", connected: false, services: ["Express", "Economy"] },
    { id: "fedex", name: "FedEx", logo: "📮", connected: false, services: ["Priority", "Economy", "Ground"] },
    { id: "aramex", name: "Aramex", logo: "🚚", connected: false, services: ["Express", "Economy"] },
];

// ============================================================================
// ZONE DIALOG
// ============================================================================

interface ZoneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    zone: ShippingZone | null;
    onSave: (zone: Partial<ShippingZone>) => void;
}

function ZoneDialog({ open, onOpenChange, zone, onSave }: ZoneDialogProps) {
    const isEditing = !!zone;
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(zone?.name || "");
    const [selectedRegions, setSelectedRegions] = useState<string[]>(zone?.regions || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        onSave({ name, regions: selectedRegions });
        
        setIsLoading(false);
        onOpenChange(false);
        toast.success(isEditing ? "Zone updated" : "Zone created");
    };

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev => 
            prev.includes(region) 
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Zone" : "Create Shipping Zone"}</DialogTitle>
                    <DialogDescription>
                        Define a shipping zone and the regions it covers
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="zone-name">Zone Name</Label>
                        <Input
                            id="zone-name"
                            placeholder="e.g., Domestic, International"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Regions</Label>
                        <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                            {availableRegions.map((region) => (
                                <button
                                    key={region.id}
                                    type="button"
                                    onClick={() => toggleRegion(region.name)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
                                        selectedRegions.includes(region.name)
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <div>
                                        <p className="text-sm font-medium">{region.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {region.countries.join(", ")}
                                        </p>
                                    </div>
                                    {selectedRegions.includes(region.name) && (
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !name || selectedRegions.length === 0}>
                            {isLoading && <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Zone"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// RATE DIALOG
// ============================================================================

interface RateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rate: ShippingRate | null;
    currency: string;
    onSave: (rate: Partial<ShippingRate>) => void;
}

function RateDialog({ open, onOpenChange, rate, currency, onSave }: RateDialogProps) {
    const isEditing = !!rate;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: rate?.name || "",
        price: rate?.price?.toString() || "",
        min_days: rate?.min_days?.toString() || "",
        max_days: rate?.max_days?.toString() || "",
        condition_type: rate?.condition_type || "none",
        condition_min: rate?.condition_min?.toString() || "",
        condition_max: rate?.condition_max?.toString() || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        onSave({
            name: formData.name,
            price: parseFloat(formData.price),
            min_days: parseInt(formData.min_days),
            max_days: parseInt(formData.max_days),
            condition_type: formData.condition_type as ShippingRate["condition_type"],
            condition_min: formData.condition_min ? parseFloat(formData.condition_min) : undefined,
            condition_max: formData.condition_max ? parseFloat(formData.condition_max) : undefined,
        });
        
        setIsLoading(false);
        onOpenChange(false);
        toast.success(isEditing ? "Rate updated" : "Rate created");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Rate" : "Add Shipping Rate"}</DialogTitle>
                    <DialogDescription>
                        Configure shipping rate details and conditions
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rate-name">Rate Name</Label>
                        <Input
                            id="rate-name"
                            placeholder="e.g., Standard Shipping, Express"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate-price">Price</Label>
                            <div className="relative">
                                <Input
                                    id="rate-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    {getCurrencySymbol(currency)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Delivery Time</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={formData.min_days}
                                    onChange={(e) => setFormData({ ...formData, min_days: e.target.value })}
                                    className="w-16"
                                    required
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                    value={formData.max_days}
                                    onChange={(e) => setFormData({ ...formData, max_days: e.target.value })}
                                    className="w-16"
                                    required
                                />
                                <span className="text-sm text-muted-foreground">days</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                        <Label>Conditions (optional)</Label>
                        <Select 
                            value={formData.condition_type} 
                            onValueChange={(value: "none" | "price" | "weight") => setFormData({ ...formData, condition_type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No conditions</SelectItem>
                                <SelectItem value="price">Based on order price</SelectItem>
                                <SelectItem value="weight">Based on order weight</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.condition_type !== "none" && (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Min"
                                    value={formData.condition_min}
                                    onChange={(e) => setFormData({ ...formData, condition_min: e.target.value })}
                                    className="w-24"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Max"
                                    value={formData.condition_max}
                                    onChange={(e) => setFormData({ ...formData, condition_max: e.target.value })}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {formData.condition_type === "price" ? getCurrencySymbol(currency) : "kg"}
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? "Save Changes" : "Add Rate"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// MAIN COMPONENT
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold">Shipping</h2>
                <p className="text-sm text-muted-foreground">
                    Configure shipping zones, rates, and delivery options
                </p>
            </div>

            <Tabs defaultValue="zones" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="zones" className="gap-2">
                        <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                        Zones & Rates
                    </TabsTrigger>
                    <TabsTrigger value="carriers" className="gap-2">
                        <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-4 w-4" />
                        Carriers
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Zones & Rates Tab */}
                <TabsContent value="zones" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Shipping Zones</CardTitle>
                                <CardDescription>
                                    Define regions and set shipping rates for each zone
                                </CardDescription>
                            </div>
                            <Button size="sm" onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }}>
                                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                                Add Zone
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {zones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                        <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-medium mb-1">No shipping zones</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create shipping zones to define delivery areas and rates
                                    </p>
                                    <Button size="sm" onClick={() => { setSelectedZone(null); setZoneDialogOpen(true); }}>
                                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
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
                                                        <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium">{zone.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {zone.regions.join(", ")}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedZone(zone); setZoneDialogOpen(true); }}>
                                                            <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                                            Edit Zone
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }}>
                                                            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                                                            Add Rate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteZone(zone.id)}
                                                        >
                                                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
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
                                                        size="sm" 
                                                        className="h-7 text-xs"
                                                        onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(null); setRateDialogOpen(true); }}
                                                    >
                                                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" />
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
                                                                        <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">{rate.name}</p>
                                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
                                                                            {rate.min_days === rate.max_days 
                                                                                ? `${rate.min_days} day${rate.min_days !== 1 ? "s" : ""}`
                                                                                : `${rate.min_days}-${rate.max_days} days`
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge variant="secondary" className="font-mono">
                                                                        {rate.price === 0 ? "Free" : formatCurrency(rate.price, currency)}
                                                                    </Badge>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => { setSelectedZoneForRate(zone.id); setSelectedRate(rate); setRateDialogOpen(true); }}>
                                                                                <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem 
                                                                                className="text-destructive focus:text-destructive"
                                                                                onClick={() => handleDeleteRate(zone.id, rate.id)}
                                                                            >
                                                                                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
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
                <TabsContent value="carriers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Carrier Integrations</CardTitle>
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
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
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
                                                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                                                    Connected
                                                </Badge>
                                                <Button variant="outline" size="sm">
                                                    Configure
                                                </Button>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={() => handleConnectCarrier(carrier.id)}>
                                                Connect
                                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-chart-1/5 border-chart-1/20">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
                                    <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-4 w-4 text-chart-1" />
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
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">General Settings</CardTitle>
                            <CardDescription>
                                Configure default shipping behavior for your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Free Shipping */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">Free Shipping Threshold</Label>
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
                                <CardTitle className="text-base">Package Presets</CardTitle>
                                <CardDescription>
                                    Define common package sizes for quick selection
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
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
                                                <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{pkg.name}</p>
                                            </div>
                                            {pkg.isDefault && (
                                                <Badge variant="secondary" className="text-[10px]">Default</Badge>
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
                    <Card className="bg-chart-2/5 border-chart-2/20">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-chart-2" />
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
