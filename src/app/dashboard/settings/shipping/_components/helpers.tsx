"use client"

import { useState } from "react"
import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShippingZone = any
type CarrierIntegration = any
type ShippingRate = any

import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency } from "@/shared/utils"

export function getCurrencySymbol(currency: string) {
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
export const mockCarriers: CarrierIntegration[] = [
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

export function ZoneDialog({ open, onOpenChange, zone, onSave }: ZoneDialogProps) {
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
                                        <CheckCircle className="size-4 text-primary" />
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
                            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
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

export function RateDialog({ open, onOpenChange, rate, currency, onSave }: RateDialogProps) {
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
                            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
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

