"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DeliveryTruck01Icon,
    PackageIcon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    Location01Icon,
    PencilEdit01Icon,
    MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Order, Fulfillment } from "../types";
import { approveFulfillment, cancelFulfillment, markFulfillmentShipped } from "../order-actions";
import { CreateFulfillmentDialog } from "./create-fulfillment-dialog";
import { UpdateTrackingDialog } from "./update-tracking-dialog";
import { cn } from "@/lib/utils";

interface OrderFulfillmentCardProps {
    order: Order;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof PackageIcon; label: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", icon: PackageIcon, label: "Pending" },
    approved: { color: "text-chart-1", bgColor: "bg-chart-1/10", icon: CheckmarkCircle02Icon, label: "Approved" },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5/10", icon: DeliveryTruck01Icon, label: "Shipped" },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2/10", icon: CheckmarkCircle02Icon, label: "Delivered" },
    cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", icon: Cancel01Icon, label: "Cancelled" },
};

export function OrderFulfillmentCard({ order }: OrderFulfillmentCardProps) {
    const router = useRouter();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    const [selectedFulfillment, setSelectedFulfillment] = useState<Fulfillment | null>(null);

    const unfulfilledLines = order.lines.filter((line) => line.quantityToFulfill > 0);
    const canCreateFulfillment = unfulfilledLines.length > 0 && order.status !== "cancelled";

    const handleApprove = async (fulfillmentId: string) => {
        const result = await approveFulfillment(fulfillmentId);
        if (result.success) {
            toast.success("Fulfillment approved");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to approve");
        }
    };

    const handleCancel = async (fulfillmentId: string) => {
        const result = await cancelFulfillment(fulfillmentId);
        if (result.success) {
            toast.success("Fulfillment cancelled");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to cancel");
        }
    };

    const handleMarkShipped = async (fulfillmentId: string) => {
        const result = await markFulfillmentShipped(fulfillmentId);
        if (result.success) {
            toast.success("Marked as shipped");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    const openTrackingDialog = (fulfillment: Fulfillment) => {
        setSelectedFulfillment(fulfillment);
        setTrackingDialogOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5" />
                            Fulfillment
                        </CardTitle>
                        {canCreateFulfillment && (
                            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                                Create Fulfillment
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Unfulfilled Items Summary */}
                    {unfulfilledLines.length > 0 && (
                        <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
                            <div className="flex items-center gap-2 text-sm">
                                <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 text-chart-4" />
                                <span className="font-medium text-chart-4">
                                    {unfulfilledLines.reduce((sum, l) => sum + l.quantityToFulfill, 0)} items awaiting fulfillment
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Fulfillments List */}
                    {order.fulfillments.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <HugeiconsIcon icon={PackageIcon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No fulfillments yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {order.fulfillments.map((fulfillment) => (
                                <FulfillmentItem
                                    key={fulfillment.id}
                                    fulfillment={fulfillment}
                                    order={order}
                                    onApprove={() => handleApprove(fulfillment.id)}
                                    onCancel={() => handleCancel(fulfillment.id)}
                                    onMarkShipped={() => handleMarkShipped(fulfillment.id)}
                                    onEditTracking={() => openTrackingDialog(fulfillment)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateFulfillmentDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                order={order}
            />

            {selectedFulfillment && (
                <UpdateTrackingDialog
                    open={trackingDialogOpen}
                    onOpenChange={setTrackingDialogOpen}
                    fulfillment={selectedFulfillment}
                />
            )}
        </>
    );
}

function FulfillmentItem({
    fulfillment,
    order,
    onApprove,
    onCancel,
    onMarkShipped,
    onEditTracking,
}: {
    fulfillment: Fulfillment;
    order: Order;
    onApprove: () => void;
    onCancel: () => void;
    onMarkShipped: () => void;
    onEditTracking: () => void;
}) {
    const status = statusConfig[fulfillment.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    // Get line details
    const lineDetails = fulfillment.lines.map((fl) => {
        const orderLine = order.lines.find((l) => l.id === fl.orderLineId);
        return {
            ...fl,
            productName: orderLine?.productName || "Unknown",
            productSku: orderLine?.productSku,
        };
    });

    return (
        <div className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("border-0 gap-1", status.bgColor, status.color)}>
                        <HugeiconsIcon icon={StatusIcon} className="h-3 w-3" />
                        {status.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {format(new Date(fulfillment.createdAt), "MMM d, yyyy")}
                    </span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {fulfillment.status === "pending" && (
                            <DropdownMenuItem onClick={onApprove}>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
                                Approve
                            </DropdownMenuItem>
                        )}
                        {(fulfillment.status === "pending" || fulfillment.status === "approved") && (
                            <DropdownMenuItem onClick={onMarkShipped}>
                                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-4 w-4 mr-2" />
                                Mark Shipped
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onEditTracking}>
                            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                            Edit Tracking
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {fulfillment.status !== "cancelled" && fulfillment.status !== "delivered" && (
                            <DropdownMenuItem onClick={onCancel} className="text-destructive">
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                                Cancel
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Items */}
            <div className="space-y-1">
                {lineDetails.map((line) => (
                    <div key={line.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{line.productName}</span>
                        <span className="font-medium">×{line.quantity}</span>
                    </div>
                ))}
            </div>

            {/* Tracking */}
            {fulfillment.trackingNumber && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        {fulfillment.shippingCarrier && `${fulfillment.shippingCarrier}: `}
                    </span>
                    {fulfillment.trackingUrl ? (
                        <a
                            href={fulfillment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-primary hover:underline"
                        >
                            {fulfillment.trackingNumber}
                        </a>
                    ) : (
                        <span className="font-mono">{fulfillment.trackingNumber}</span>
                    )}
                </div>
            )}
        </div>
    );
}
