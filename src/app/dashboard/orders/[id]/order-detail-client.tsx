"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Order } from "../types";
import {
    OrderHeader,
    OrderItemsCard,
    OrderFulfillmentCard,
    OrderTransactionsCard,
    OrderInvoicesCard,
    OrderCustomerCard,
    OrderSummaryCard,
    OrderTimelineCard,
    OrderNotesCard,
} from "../components";
import { cancelOrder } from "../actions";

interface OrderDetailClientProps {
    order: Order;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
    const router = useRouter();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            const formData = new FormData();
            formData.set("orderId", order.id);
            await cancelOrder(formData);
            toast.success("Order cancelled");
            router.refresh();
        } catch (error) {
            toast.error("Failed to cancel order");
        } finally {
            setIsCancelling(false);
            setCancelDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <OrderHeader order={order} onCancel={() => setCancelDialogOpen(true)} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <OrderItemsCard order={order} />

                    {/* Fulfillment */}
                    <OrderFulfillmentCard order={order} />

                    {/* Transactions */}
                    <OrderTransactionsCard order={order} />
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <OrderSummaryCard order={order} />

                    {/* Customer */}
                    <OrderCustomerCard order={order} />

                    {/* Invoices */}
                    <OrderInvoicesCard order={order} />

                    {/* Timeline */}
                    <OrderTimelineCard order={order} />

                    {/* Notes */}
                    <OrderNotesCard order={order} />
                </div>
            </div>

            {/* Cancel Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel order #{order.orderNumber}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCancelling ? "Cancelling..." : "Cancel Order"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
