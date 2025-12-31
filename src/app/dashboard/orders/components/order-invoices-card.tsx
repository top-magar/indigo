"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Invoice01Icon,
    Download01Icon,
    Mail01Icon,
    Add01Icon,
    CheckmarkCircle02Icon,
    Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Order, Invoice, InvoiceStatus } from "../types";
import { generateInvoice, sendInvoice } from "../order-actions";
import { cn } from "@/lib/utils";

interface OrderInvoicesCardProps {
    order: Order;
}

const statusConfig: Record<InvoiceStatus, { color: string; bgColor: string; label: string }> = {
    draft: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Draft" },
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Pending" },
    sent: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Sent" },
    paid: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Paid" },
    cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Cancelled" },
};

export function OrderInvoicesCard({ order }: OrderInvoicesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        startTransition(async () => {
            const result = await generateInvoice(order.id);
            if (result.success) {
                toast.success("Invoice generated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate invoice");
            }
        });
    };

    const handleSend = (invoiceId: string) => {
        startTransition(async () => {
            const result = await sendInvoice(invoiceId);
            if (result.success) {
                toast.success("Invoice sent");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to send invoice");
            }
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5" />
                        Invoices
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isPending}
                    >
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-1" />
                        Generate
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {order.invoices.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <HugeiconsIcon icon={Invoice01Icon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No invoices yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {order.invoices.map((invoice) => (
                            <InvoiceItem
                                key={invoice.id}
                                invoice={invoice}
                                onSend={() => handleSend(invoice.id)}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InvoiceItem({
    invoice,
    onSend,
    isPending,
}: {
    invoice: Invoice;
    onSend: () => void;
    isPending: boolean;
}) {
    const status = statusConfig[invoice.status] || statusConfig.pending;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", status.bgColor)}>
                    <HugeiconsIcon
                        icon={invoice.status === "sent" || invoice.status === "paid" ? CheckmarkCircle02Icon : Clock01Icon}
                        className={cn("h-4 w-4", status.color)}
                    />
                </div>
                <div>
                    <p className="font-medium font-mono text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                        {invoice.sentAt && ` • Sent ${format(new Date(invoice.sentAt), "MMM d")}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("border-0", status.bgColor, status.color)}>
                    {status.label}
                </Badge>
                {invoice.url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                        </a>
                    </Button>
                )}
                {(invoice.status === "pending" || invoice.status === "draft") && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onSend}
                        disabled={isPending}
                    >
                        <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
