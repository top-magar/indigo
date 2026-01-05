"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CreditCardIcon,
    CheckmarkCircle02Icon,
    Clock01Icon,
    Cancel01Icon,
    ArrowDown01Icon,
    ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Order, Transaction, TransactionType, TransactionStatus } from "../types";
import { MarkAsPaidDialog } from "./mark-as-paid-dialog";
import { RefundDialog } from "./refund-dialog";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderTransactionsCardProps {
    order: Order;
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowDown01Icon; label: string; color: string }> = {
    authorization: { icon: Clock01Icon, label: "Authorization", color: "text-chart-1" },
    charge: { icon: ArrowDown01Icon, label: "Charge", color: "text-chart-2" },
    capture: { icon: ArrowDown01Icon, label: "Capture", color: "text-chart-2" },
    refund: { icon: ArrowUp01Icon, label: "Refund", color: "text-chart-5" },
    void: { icon: Cancel01Icon, label: "Void", color: "text-muted-foreground" },
    chargeback: { icon: Cancel01Icon, label: "Chargeback", color: "text-destructive" },
};

const statusConfig: Record<TransactionStatus, { color: string; bgColor: string; label: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Pending" },
    success: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Success" },
    failed: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Failed" },
    cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Cancelled" },
};

export function OrderTransactionsCard({ order }: OrderTransactionsCardProps) {
    const [markPaidOpen, setMarkPaidOpen] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);

    const canMarkAsPaid = order.paymentStatus === "pending" || order.paymentStatus === "authorized";
    const canRefund = order.paymentStatus === "paid" || order.paymentStatus === "partially_paid";

    // Calculate totals
    const totalCharged = order.transactions
        .filter((t) => (t.type === "charge" || t.type === "capture") && t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = order.transactions
        .filter((t) => t.type === "refund" && t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalCharged - totalRefunded;

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5" />
                            Transactions
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {canRefund && (
                                <Button variant="outline" size="sm" onClick={() => setRefundOpen(true)}>
                                    Refund
                                </Button>
                            )}
                            {canMarkAsPaid && (
                                <Button size="sm" onClick={() => setMarkPaidOpen(true)}>
                                    Mark as Paid
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Charged</p>
                            <p className="font-semibold text-chart-2">
                                {formatCurrency(totalCharged, order.currency)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Refunded</p>
                            <p className="font-semibold text-chart-5">
                                {formatCurrency(totalRefunded, order.currency)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Net</p>
                            <p className="font-semibold">
                                {formatCurrency(netAmount, order.currency)}
                            </p>
                        </div>
                    </div>

                    {/* Transactions List */}
                    {order.transactions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <HugeiconsIcon icon={CreditCardIcon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {order.transactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <MarkAsPaidDialog
                open={markPaidOpen}
                onOpenChange={setMarkPaidOpen}
                order={order}
            />

            <RefundDialog
                open={refundOpen}
                onOpenChange={setRefundOpen}
                order={order}
            />
        </>
    );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
    const type = typeConfig[transaction.type] || typeConfig.charge;
    const status = statusConfig[transaction.status] || statusConfig.pending;
    const TypeIcon = type.icon;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", status.bgColor)}>
                    <HugeiconsIcon icon={TypeIcon} className={cn("h-4 w-4", type.color)} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{type.label}</span>
                        <Badge variant="secondary" className={cn("border-0 text-xs", status.bgColor, status.color)}>
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
                    </p>
                </div>
            </div>
            <span className={cn("font-semibold", transaction.type === "refund" ? "text-chart-5" : "")}>
                {transaction.type === "refund" ? "-" : ""}
                {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: transaction.currency,
                }).format(transaction.amount)}
            </span>
        </div>
    );
}
