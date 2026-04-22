"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Mail, ShoppingCart, DollarSign, Users } from "lucide-react";
import { EntityListPage, type StatItem } from "@/components/dashboard/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/shared/utils";
import { type AbandonedCheckout, type AbandonedStats, sendRecoveryEmail, bulkSendRecoveryEmails } from "./actions";

interface Props {
    initialCheckouts: AbandonedCheckout[];
    initialStats: AbandonedStats;
    currency: string;
}

export function AbandonedCheckoutsClient({ initialCheckouts, initialStats, currency }: Props) {
    const [checkouts, setCheckouts] = useState(initialCheckouts);
    const [stats] = useState(initialStats);
    const [isPending, startTransition] = useTransition();

    function handleSendRecovery(cartId: string) {
        startTransition(async () => {
            const result = await sendRecoveryEmail(cartId);
            if (result.success) {
                toast.success("Recovery email sent");
                setCheckouts((prev) => prev.map((c) => c.id === cartId ? { ...c, recovery_email_sent: true } : c));
            } else {
                toast.error(result.error ?? "Failed to send");
            }
        });
    }

    function handleBulkSend() {
        const recoverable = checkouts.filter((c) => c.email && !c.recovery_email_sent).map((c) => c.id);
        if (!recoverable.length) { toast.info("No recoverable checkouts"); return; }
        startTransition(async () => {
            const result = await bulkSendRecoveryEmails(recoverable);
            toast.success(`Sent ${result.sent} recovery emails`);
            setCheckouts((prev) => prev.map((c) => recoverable.includes(c.id) ? { ...c, recovery_email_sent: true } : c));
        });
    }

    const recoverable = checkouts.filter((c) => c.email && !c.recovery_email_sent);

    const statItems: StatItem[] = [
        { label: "Abandoned", value: stats.total, icon: <ShoppingCart className="size-4 text-muted-foreground" /> },
        { label: "Recoverable", value: stats.recoverable, icon: <Users className="size-4 text-muted-foreground" /> },
        { label: "Lost Revenue", value: formatCurrency(stats.totalValue, currency), icon: <DollarSign className="size-4 text-muted-foreground" /> },
    ];

    return (
        <EntityListPage
            title="Abandoned Checkouts"
            description="Recover lost sales from incomplete checkouts."
            actions={
                recoverable.length > 0 ? (
                    <Button onClick={handleBulkSend} disabled={isPending} className="gap-2">
                        <Mail className="size-4" />
                        Send recovery to {recoverable.length} checkout{recoverable.length !== 1 ? "s" : ""}
                    </Button>
                ) : undefined
            }
            stats={statItems}
        >

            {/* Table */}
            <div className="rounded-lg border">
                    {checkouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No abandoned checkouts found. 🎉</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkouts.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{c.customer_name || "Guest"}</p>
                                                <p className="text-xs text-muted-foreground">{c.email || "No email"}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{formatCurrency(parseFloat(c.total || "0"), currency)}</TableCell>
                                        <TableCell>
                                            {c.recovery_email_sent ? (
                                                <Badge variant="outline" className="text-success">Sent</Badge>
                                            ) : c.email ? (
                                                <Badge variant="outline" className="text-warning">Recoverable</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">No email</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {c.email && !c.recovery_email_sent && (
                                                <Button
                                                    variant="outline"
                                                   
                                                    onClick={() => handleSendRecovery(c.id)}
                                                    disabled={isPending}
                                                >
                                                    <Mail className="mr-1 size-3.5" /> Recover
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
            </div>
        </EntityListPage>
    );
}
