"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/shared/utils";
import {
    searchProductsForOrder,
    createDraftOrder,
    type DraftOrderLineInput,
} from "../order-actions";

interface ProductResult {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    status: string;
}

interface DraftOrderClientProps {
    currency: string;
}

export function DraftOrderClient({ currency }: DraftOrderClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Customer
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [notes, setNotes] = useState("");

    // Product search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Line items
    const [lines, setLines] = useState<(DraftOrderLineInput & { key: string })[]>([]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const results = await searchProductsForOrder(query);
            setSearchResults(results);
        } finally {
            setIsSearching(false);
        }
    }, []);

    function addProduct(product: ProductResult) {
        const existing = lines.find((l) => l.productId === product.id);
        if (existing) {
            setLines(lines.map((l) => l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l));
        } else {
            setLines([...lines, {
                key: crypto.randomUUID(),
                productId: product.id,
                productName: product.name,
                productSku: product.sku ?? undefined,
                productImage: product.images?.[0] ?? undefined,
                quantity: 1,
                unitPrice: product.price,
            }]);
        }
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
    }

    function removeLine(key: string) {
        setLines(lines.filter((l) => l.key !== key));
    }

    function updateQuantity(key: string, qty: number) {
        if (qty < 1) return;
        setLines(lines.map((l) => l.key === key ? { ...l, quantity: qty } : l));
    }

    function updatePrice(key: string, price: number) {
        setLines(lines.map((l) => l.key === key ? { ...l, unitPrice: price } : l));
    }

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    function handleCreate() {
        if (!lines.length) { toast.error("Add at least one product"); return; }
        startTransition(async () => {
            const result = await createDraftOrder({
                customerName: customerName || undefined,
                customerEmail: customerEmail || undefined,
                internalNotes: notes || undefined,
                lines: lines.map(({ key, ...rest }) => rest),
            });
            if (result.success) {
                toast.success("Draft order created");
                router.push(result.orderId ? `/dashboard/orders/${result.orderId}` : "/dashboard/orders");
            } else {
                toast.error(result.error ?? "Failed to create order");
            }
        });
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon-sm" aria-label="Back to orders" asChild>
                    <Link href="/dashboard/orders"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">Create order</h1>
                    <p className="text-sm text-muted-foreground">Create a draft order for phone, wholesale, or manual sales.</p>
                </div>
                <Button onClick={handleCreate} disabled={isPending || !lines.length}>
                    {isPending ? "Creating…" : "Create draft order"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
                {/* Main column */}
                <div className="space-y-3">
                    {/* Products */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Products</CardTitle>
                            <Button variant="outline" onClick={() => setShowSearch(true)}>
                                <Plus className="mr-1 size-4" /> Add product
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {showSearch && (
                                <div className="mb-4 relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                aria-label="Search products" placeholder="Search products…"
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                className="pl-9"
                                                autoFocus
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" aria-label="Close search" onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(""); }}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
                                            {searchResults.map((p) => (
                                                <button
                                                    key={p.id}
                                                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent text-sm"
                                                    onClick={() => addProduct(p)}
                                                >
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded bg-muted" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-medium">{p.name}</p>
                                                        {p.sku && <p className="text-xs text-muted-foreground">{p.sku}</p>}
                                                    </div>
                                                    <span className="text-muted-foreground">{formatCurrency(p.price, currency)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {isSearching && <p className="text-xs text-muted-foreground mt-1">Searching…</p>}
                                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">No products found.</p>
                                    )}
                                </div>
                            )}

                            {lines.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No products added yet. Click &quot;Add product&quot; to search.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {lines.map((line) => (
                                        <div key={line.key} className="flex items-center gap-3 rounded-md border p-3">
                                            {line.productImage ? (
                                                <img src={line.productImage} alt="" className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-md bg-muted" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{line.productName}</p>
                                                {line.productSku && <p className="text-xs text-muted-foreground">{line.productSku}</p>}
                                            </div>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={line.quantity}
                                                onChange={(e) => updateQuantity(line.key, parseInt(e.target.value) || 1)}
                                                className="w-16 text-center"
                                            />
                                            <span className="text-xs text-muted-foreground">×</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={line.unitPrice}
                                                onChange={(e) => updatePrice(line.key, parseFloat(e.target.value) || 0)}
                                                className="w-24"
                                            />
                                            <span className="text-sm font-medium w-24 text-right">
                                                {formatCurrency(line.unitPrice * line.quantity, currency)}
                                            </span>
                                            <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => removeLine(line.key)}>
                                                <Trash2 className="size-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Internal notes (not visible to customer)…"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Customer */}
                    <Card>
                        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="customerName">Name</Label>
                                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="customerEmail">Email</Label>
                                <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@example.com" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card>
                        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal ({lines.reduce((s, l) => s + l.quantity, 0)} items)</span>
                                <span>{formatCurrency(subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-muted-foreground">Calculated later</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-muted-foreground">Calculated later</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal, currency)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
