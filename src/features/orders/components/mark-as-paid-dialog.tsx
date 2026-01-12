"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Order } from "@/features/orders/types";
import { markAsPaid } from "@/app/dashboard/orders/order-actions";
import { formatCurrency } from "@/shared/utils";

interface MarkAsPaidDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order;
}

export function MarkAsPaidDialog({ open, onOpenChange, order }: MarkAsPaidDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await markAsPaid(order.id);

            if (result.success) {
                toast.success("Order marked as paid");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to mark as paid");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-chart-2" />
                        Mark as Paid
                    </DialogTitle>
                    <DialogDescription>
                        This will record a manual payment for order #{order.orderNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Order Total</span>
                            <span className="font-semibold">
                                {formatCurrency(order.total, order.currency)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span>Manual</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Use this when payment was received outside of the system (e.g., cash, bank transfer).
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleConfirm} disabled={isPending}>
                        {isPending ? "Processing..." : "Confirm Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
