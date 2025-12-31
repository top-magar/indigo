"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Order } from "../types";
import { createRefund } from "../order-actions";

interface RefundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order;
}

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(value);
}

export function RefundDialog({ open, onOpenChange, order }: RefundDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Calculate max refundable amount
    const totalCharged = order.transactions
        .filter((t) => (t.type === "charge" || t.type === "capture") && t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = order.transactions
        .filter((t) => t.type === "refund" && t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0);

    const maxRefundable = totalCharged - totalRefunded;

    const [amount, setAmount] = useState(maxRefundable.toString());
    const [reason, setReason] = useState("");
    const [notifyCustomer, setNotifyCustomer] = useState(true);

    const handleSubmit = () => {
        const refundAmount = parseFloat(amount);

        if (isNaN(refundAmount) || refundAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (refundAmount > maxRefundable) {
            toast.error(`Maximum refundable amount is ${formatCurrency(maxRefundable, order.currency)}`);
            return;
        }

        startTransition(async () => {
            const result = await createRefund({
                orderId: order.id,
                amount: refundAmount,
                reason: reason || undefined,
                notifyCustomer,
            });

            if (result.success) {
                toast.success("Refund processed");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to process refund");
            }
        });
    };

    const setFullRefund = () => {
        setAmount(maxRefundable.toString());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5 text-chart-5" />
                        Issue Refund
                    </DialogTitle>
                    <DialogDescription>
                        Refund payment for order #{order.orderNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="amount">Refund Amount</Label>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={setFullRefund}
                            >
                                Full refund ({formatCurrency(maxRefundable, order.currency)})
                            </Button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {order.currency}
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={maxRefundable}
                                className="pl-14"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum refundable: {formatCurrency(maxRefundable, order.currency)}
                        </p>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for refund..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Notify Customer */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="notify"
                            checked={notifyCustomer}
                            onCheckedChange={(checked) => setNotifyCustomer(checked === true)}
                        />
                        <Label htmlFor="notify" className="text-sm font-normal">
                            Send refund notification to customer
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !amount || parseFloat(amount) <= 0}
                        variant="destructive"
                    >
                        {isPending ? "Processing..." : `Refund ${formatCurrency(parseFloat(amount) || 0, order.currency)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
