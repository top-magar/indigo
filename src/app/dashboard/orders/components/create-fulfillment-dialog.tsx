"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon, MinusSignIcon, Add01Icon } from "@hugeicons/core-free-icons";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Order } from "../types";
import { createFulfillment } from "../order-actions";

interface CreateFulfillmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order;
}

export function CreateFulfillmentDialog({
    open,
    onOpenChange,
    order,
}: CreateFulfillmentDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Get unfulfilled lines
    const unfulfilledLines = order.lines.filter((line) => line.quantityToFulfill > 0);

    // State for quantities
    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        unfulfilledLines.forEach((line) => {
            initial[line.id] = line.quantityToFulfill;
        });
        return initial;
    });

    // Tracking info
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");
    const [shippingCarrier, setShippingCarrier] = useState("");
    const [notifyCustomer, setNotifyCustomer] = useState(true);

    const updateQuantity = (lineId: string, delta: number) => {
        const line = unfulfilledLines.find((l) => l.id === lineId);
        if (!line) return;

        setQuantities((prev) => ({
            ...prev,
            [lineId]: Math.max(0, Math.min(line.quantityToFulfill, (prev[lineId] || 0) + delta)),
        }));
    };

    const setQuantity = (lineId: string, value: number) => {
        const line = unfulfilledLines.find((l) => l.id === lineId);
        if (!line) return;

        setQuantities((prev) => ({
            ...prev,
            [lineId]: Math.max(0, Math.min(line.quantityToFulfill, value)),
        }));
    };

    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const hasItems = totalItems > 0;

    const handleSubmit = () => {
        if (!hasItems) {
            toast.error("Select at least one item to fulfill");
            return;
        }

        const lines = Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([orderLineId, quantity]) => ({ orderLineId, quantity }));

        startTransition(async () => {
            const result = await createFulfillment({
                orderId: order.id,
                lines,
                trackingNumber: trackingNumber || undefined,
                trackingUrl: trackingUrl || undefined,
                shippingCarrier: shippingCarrier || undefined,
                notifyCustomer,
            });

            if (result.success) {
                toast.success("Fulfillment created");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create fulfillment");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={PackageIcon} className="h-5 w-5" />
                        Create Fulfillment
                    </DialogTitle>
                    <DialogDescription>
                        Select items and quantities to fulfill for order #{order.orderNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Items */}
                    <div className="space-y-3">
                        <Label>Items to Fulfill</Label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {unfulfilledLines.map((line) => (
                                <div
                                    key={line.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{line.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {line.quantityToFulfill} available
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(line.id, -1)}
                                            disabled={quantities[line.id] === 0}
                                        >
                                            <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={line.quantityToFulfill}
                                            value={quantities[line.id] || 0}
                                            onChange={(e) => setQuantity(line.id, parseInt(e.target.value) || 0)}
                                            className="w-16 text-center"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(line.id, 1)}
                                            disabled={quantities[line.id] >= line.quantityToFulfill}
                                        >
                                            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tracking Info */}
                    <div className="space-y-4">
                        <Label>Tracking Information (Optional)</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="carrier" className="text-xs text-muted-foreground">
                                    Carrier
                                </Label>
                                <Input
                                    id="carrier"
                                    placeholder="e.g., FedEx, UPS"
                                    value={shippingCarrier}
                                    onChange={(e) => setShippingCarrier(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tracking" className="text-xs text-muted-foreground">
                                    Tracking Number
                                </Label>
                                <Input
                                    id="tracking"
                                    placeholder="Tracking number"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trackingUrl" className="text-xs text-muted-foreground">
                                Tracking URL
                            </Label>
                            <Input
                                id="trackingUrl"
                                placeholder="https://..."
                                value={trackingUrl}
                                onChange={(e) => setTrackingUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notify Customer */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="notify"
                            checked={notifyCustomer}
                            onCheckedChange={(checked) => setNotifyCustomer(checked === true)}
                        />
                        <Label htmlFor="notify" className="text-sm font-normal">
                            Send shipment notification to customer
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || !hasItems}>
                        {isPending ? "Creating..." : `Fulfill ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
