"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { CreditCard, Gift, DollarSign, Plus, Copy, ToggleLeft, ToggleRight, Search, MoreHorizontal } from "lucide-react";
import { EntityListPage } from "@/components/dashboard/templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { formatCurrency } from "@/shared/utils";
import { type GiftCard, type GiftCardStats, createGiftCard, toggleGiftCardStatus } from "./actions";

type StatusFilter = "all" | "active" | "inactive" | "depleted";

function getCardStatus(card: GiftCard): "active" | "inactive" | "depleted" {
    if (card.current_balance <= 0) return "depleted";
    return card.is_active ? "active" : "inactive";
}

interface Props {
    initialCards: GiftCard[];
    initialStats: GiftCardStats;
    currency: string;
}

export function GiftCardsClient({ initialCards, initialStats, currency }: Props) {
    const [cards, setCards] = useState(initialCards);
    const [stats, setStats] = useState(initialStats);
    const [isPending, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // Pagination
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Form state
    const [balance, setBalance] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [note, setNote] = useState("");

    const filtered = useMemo(() => {
        let result = cards;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((c) =>
                c.code.toLowerCase().includes(q) ||
                c.customer_name?.toLowerCase().includes(q) ||
                c.customer_email?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((c) => getCardStatus(c) === statusFilter);
        }
        return result;
    }, [cards, search, statusFilter]);

    const pageCount = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // Reset to first page when filters change
    function handleSearchChange(value: string) {
        setSearch(value);
        setPageIndex(0);
    }
    function handleStatusChange(value: StatusFilter) {
        setStatusFilter(value);
        setPageIndex(0);
    }

    function handleCreate() {
        const amount = parseFloat(balance);
        if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
        startTransition(async () => {
            const result = await createGiftCard({
                initialBalance: amount,
                customerName: customerName || undefined,
                customerEmail: customerEmail || undefined,
                note: note || undefined,
            });
            if (result.success && result.card) {
                toast.success(`Gift card ${result.card.code} created`);
                setCards((prev) => [result.card!, ...prev]);
                setStats((s) => ({ ...s, total: s.total + 1, active: s.active + 1, totalIssued: s.totalIssued + amount, totalRemaining: s.totalRemaining + amount }));
                setDialogOpen(false);
                setBalance(""); setCustomerName(""); setCustomerEmail(""); setNote("");
            } else {
                toast.error(result.error ?? "Failed to create");
            }
        });
    }

    function handleToggle(card: GiftCard) {
        startTransition(async () => {
            const result = await toggleGiftCardStatus(card.id, !card.is_active);
            if (result.success) {
                setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, is_active: !c.is_active } : c));
                toast.success(card.is_active ? "Card deactivated" : "Card activated");
            } else {
                toast.error(result.error ?? "Failed");
            }
        });
    }

    function copyCode(code: string) {
        navigator.clipboard.writeText(code);
        toast.success("Code copied");
    }

    return (
        <EntityListPage
            title="Gift Cards"
            actions={
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="size-4" /> Issue gift card</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Issue Gift Card</DialogTitle></DialogHeader>
                        <DialogDescription className="sr-only">Create a new gift card with a specified value</DialogDescription>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="gc-balance">Initial Balance ({currency})</Label>
                                <Input id="gc-balance" type="number" min={1} step={0.01} value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="1000" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="gc-name">Recipient Name</Label>
                                    <Input id="gc-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gc-email">Recipient Email</Label>
                                    <Input id="gc-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Optional" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="gc-note">Note</Label>
                                <Input id="gc-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isPending}>{isPending ? "Creating…" : "Issue card"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
            stats={[
                { label: "Total Issued", value: stats.total, icon: <Gift className="size-4 text-muted-foreground" /> },
                { label: "Active", value: stats.active, icon: <CreditCard className="size-4 text-muted-foreground" /> },
                { label: "Total Value Issued", value: formatCurrency(stats.totalIssued, currency), icon: <DollarSign className="size-4 text-muted-foreground" /> },
                { label: "Outstanding Balance", value: formatCurrency(stats.totalRemaining, currency), icon: <DollarSign className="size-4 text-muted-foreground" /> },
            ]}
        >
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by code, name, or email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => handleStatusChange(v as StatusFilter)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="depleted">Depleted</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            {cards.length === 0
                                ? 'No gift cards issued yet. Click "Issue gift card" to create one.'
                                : "No gift cards match your filters."}
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paged.map((card) => (
                                    <TableRow key={card.id}>
                                        <TableCell>
                                            <code className="text-sm font-mono">{card.code}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{card.customer_name || "—"}</p>
                                                {card.customer_email && <p className="text-xs text-muted-foreground">{card.customer_email}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{formatCurrency(card.current_balance, currency)}</p>
                                                {card.current_balance < card.initial_balance && (
                                                    <p className="text-xs text-muted-foreground">of {formatCurrency(card.initial_balance, currency)}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getCardStatus(card) === "active" ? (
                                                <Badge variant="outline" className="text-success">Active</Badge>
                                            ) : getCardStatus(card) === "depleted" ? (
                                                <Badge variant="outline" className="text-muted-foreground">Depleted</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-warning">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => copyCode(card.code)}>
                                                        <Copy className="size-3.5" />
                                                        Copy code
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggle(card)}
                                                        disabled={isPending}
                                                        className={card.is_active ? "text-destructive" : ""}
                                                    >
                                                        {card.is_active ? <ToggleLeft className="size-3.5" /> : <ToggleRight className="size-3.5" />}
                                                        {card.is_active ? "Deactivate" : "Activate"}
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

            {/* Pagination */}
            {filtered.length > 0 && (
                <DataTablePagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    totalItems={filtered.length}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(size) => { setPageSize(size); setPageIndex(0); }}
                />
            )}
        </EntityListPage>
    );
}
