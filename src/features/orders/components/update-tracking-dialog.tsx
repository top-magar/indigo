"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
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
import { toast } from "sonner";
import type { Fulfillment } from "@/features/orders/types";
import { updateFulfillmentTracking } from "@/app/dashboard/orders/order-actions";

interface UpdateTrackingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fulfillment: Fulfillment;
}

export function UpdateTrackingDialog({
    open,
    onOpenChange,
    fulfillment,
}: UpdateTrackingDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [trackingNumber, setTrackingNumber] = useState(fulfillment.trackingNumber || "");
    const [trackingUrl, setTrackingUrl] = useState(fulfillment.trackingUrl || "");
    const [shippingCarrier, setShippingCarrier] = useState(fulfillment.shippingCarrier || "");

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await updateFulfillmentTracking({
                fulfillmentId: fulfillment.id,
                trackingNumber: trackingNumber || undefined,
                trackingUrl: trackingUrl || undefined,
                shippingCarrier: shippingCarrier || undefined,
            });

            if (result.success) {
                toast.success("Tracking updated");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update tracking");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={Location01Icon} className="h-5 w-5" />
                        Update Tracking
                    </DialogTitle>
                    <DialogDescription>
                        Update tracking information for this fulfillment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="carrier">Shipping Carrier</Label>
                        <Input
                            id="carrier"
                            placeholder="e.g., FedEx, UPS, DHL"
                            value={shippingCarrier}
                            onChange={(e) => setShippingCarrier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tracking">Tracking Number</Label>
                        <Input
                            id="tracking"
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">Tracking URL</Label>
                        <Input
                            id="url"
                            placeholder="https://..."
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
