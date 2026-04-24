"use client";

import { useState, useMemo, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Mail, ShoppingCart, DollarSign, Users, Search, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { EntityListPage, type StatItem } from "@/components/dashboard/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = useMemo(() => {
        let result = checkouts;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) => c.customer_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((c) => {
                if (statusFilter === "sent") return c.recovery_email_sent;
                if (statusFilter === "recoverable") return c.email && !c.recovery_email_sent;
                if (statusFilter === "no-email") return !c.email;
                return true;
            });
        }
        return result;
    }, [checkouts, search, statusFilter]);

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

    function handleRemove(cartId: string) {
        setCheckouts((prev) => prev.filter((c) => c.id !== cartId));
        toast.success("Cart removed from list");
    }

    const recoverable = checkouts.filter((c) => c.email && !c.recovery_email_sent);

    const statItems: StatItem[] = [
        { label: "Abandoned", value: stats.total, icon: <ShoppingCart className="size-4 text-muted-foreground" /> },
        { label: "Recoverable", value: stats.recoverable, icon: <Users className="size-4 text-muted-foreground" /> },
        { label: "Lost Revenue", value: formatCurrency(stats.totalValue, currency), icon: <DollarSign className="size-4 text-muted-foreground" /> },
    ];

    return (
        <EntityListPage
            title="Abandoned Carts"
            actions={
                recoverable.length > 0 ? (
                    <Button onClick={handleBulkSend} disabled={isPending}>
                        <Mail className="size-4" />
                        Send recovery to {recoverable.length} checkout{recoverable.length !== 1 ? "s" : ""}
                    </Button>
                ) : undefined
            }
            filters={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search abandoned carts..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="recoverable">Recoverable</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="no-email">No Email</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            }
        >

            {/* Table */}
            <div className="rounded-lg border">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No abandoned checkouts found. 🎉</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((c) => (
                                    <TableRow key={c.id} className="group">
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
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="More actions"
                                                        className="size-8 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    {c.email && !c.recovery_email_sent && (
                                                        <DropdownMenuItem onClick={() => handleSendRecovery(c.id)} disabled={isPending}>
                                                            <Mail className="size-3.5" />
                                                            Send Recovery Email
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem disabled>
                                                        <Eye className="size-3.5" />
                                                        View Cart Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleRemove(c.id)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
