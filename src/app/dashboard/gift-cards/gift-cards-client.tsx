"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CreditCard, Gift, DollarSign, Plus, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { PRODUCT_TABS } from "@/components/dashboard/section-tabs";
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
import { formatCurrency } from "@/shared/utils";
import { type GiftCard, type GiftCardStats, createGiftCard, toggleGiftCardStatus } from "./actions";

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

    // Form state
    const [balance, setBalance] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [note, setNote] = useState("");

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
            tabs={PRODUCT_TABS}
            title="Gift Cards"
            description="Issue and manage gift cards for your store."
            actions={
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="h-4 w-4" /> Issue gift card</Button>
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
                { label: "Total Issued", value: stats.total, icon: <Gift className="h-4 w-4 text-muted-foreground" /> },
                { label: "Active", value: stats.active, icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> },
                { label: "Total Value Issued", value: formatCurrency(stats.totalIssued, currency), icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
                { label: "Outstanding Balance", value: formatCurrency(stats.totalRemaining, currency), icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
            ]}
        >
            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Gift Cards</CardTitle>
                    <CardDescription>All issued gift cards and their balances.</CardDescription>
                </CardHeader>
                <CardContent>
                    {cards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No gift cards issued yet. Click &quot;Issue gift card&quot; to create one.</p>
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
                                {cards.map((card) => (
                                    <TableRow key={card.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono">{card.code}</code>
                                                <Button variant="ghost" size="icon-sm" aria-label="Copy" className="h-6 w-6" onClick={() => copyCode(card.code)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
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
                                            {card.is_active && card.current_balance > 0 ? (
                                                <Badge variant="outline" className="text-success">Active</Badge>
                                            ) : card.current_balance <= 0 ? (
                                                <Badge variant="outline" className="text-muted-foreground">Depleted</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-warning">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" onClick={() => handleToggle(card)} disabled={isPending}>
                                                {card.is_active ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                                                {card.is_active ? "Deactivate" : "Activate"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </EntityListPage>
    );
}
