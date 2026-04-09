"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Percent,
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Copy,
    Loader2,
} from "lucide-react";
import { CreateSaleDialog } from "@/features/discounts/components/create-sale-dialog";
import { deleteDiscount, duplicateDiscount, toggleDiscountStatus, deleteDiscounts } from "../actions";
import {
    getDiscountStatus,
    getStatusBadgeVariant,
    getStatusLabel,
    formatDiscountValueWithLabel,
    formatDateRange,
} from "../utils";
import type { Discount } from "../types";
import Link from "next/link";
import { toast } from "sonner";
import { EntityListPage } from "@/components/dashboard/templates";

interface SalesClientProps {
    initialSales: Discount[];
}

export function SalesClient({ initialSales }: SalesClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const sales = initialSales;

    const filteredSales = sales.filter((sale) => {
        const matchesSearch = sale.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status = getDiscountStatus(sale);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSales.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSales.map((s) => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            const result = await deleteDiscount(id);
            if (result.success) {
                toast.success("Sale deleted");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete sale");
            }
        });
    };

    const handleDuplicate = async (id: string) => {
        startTransition(async () => {
            const result = await duplicateDiscount(id);
            if (result.success) {
                toast.success("Sale duplicated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to duplicate sale");
            }
        });
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        startTransition(async () => {
            const result = await toggleDiscountStatus(id, isActive);
            if (result.success) {
                toast.success(isActive ? "Sale activated" : "Sale deactivated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update sale");
            }
        });
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            const result = await deleteDiscounts(selectedIds);
            if (result.success) {
                toast.success(`${selectedIds.length} sales deleted`);
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete sales");
            }
        });
    };

    const handleCreateSuccess = () => {
        setCreateDialogOpen(false);
        router.refresh();
    };

    const getAssignmentCount = (sale: Discount) => {
        const products = sale.applicableProductIds?.length || 0;
        const collections = sale.applicableCollectionIds?.length || 0;
        const categories = sale.applicableCategoryIds?.length || 0;
        return { products, collections, categories };
    };

    if (sales.length === 0 && !searchQuery && statusFilter === "all") {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Percent className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-2">No sales yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Create your first sale to automatically apply discounts to products.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Sale
                </Button>
                <CreateSaleDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        );
    }

    return (
        <EntityListPage
            title="Sales"
            description="Sales are automatically applied to products without requiring a code"
            actions={
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Sale
                </Button>
            }
        >

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4"
                    />
                    <Input
                        aria-label="Search sales" placeholder="Search sales..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedIds.length} selected
                    </span>
                    <Button
                        variant="destructive"
                       
                        onClick={handleBulkDelete}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                        Delete
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedIds.length === filteredSales.length && filteredSales.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Sale</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Valid Period</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No sales found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSales.map((sale) => {
                                const status = getDiscountStatus(sale);
                                const counts = getAssignmentCount(sale);
                                return (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(sale.id)}
                                                onCheckedChange={() => toggleSelect(sale.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/dashboard/marketing/discounts/sales/${sale.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {sale.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {formatDiscountValueWithLabel(sale.type, parseFloat(sale.value))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {counts.products > 0 && (
                                                    <span>{counts.products} products</span>
                                                )}
                                                {counts.products > 0 && counts.collections > 0 && ", "}
                                                {counts.collections > 0 && (
                                                    <span>{counts.collections} collections</span>
                                                )}
                                                {(counts.products > 0 || counts.collections > 0) && counts.categories > 0 && ", "}
                                                {counts.categories > 0 && (
                                                    <span>{counts.categories} categories</span>
                                                )}
                                                {counts.products === 0 && counts.collections === 0 && counts.categories === 0 && (
                                                    <span className="text-muted-foreground">No products</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(status)}>
                                                {getStatusLabel(status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDateRange(sale.startsAt, sale.endsAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm" aria-label="More actions" disabled={isPending}>
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/marketing/discounts/sales/${sale.id}`}>
                                                            <Edit className="size-3.5 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(sale.id)}>
                                                        <Copy className="size-3.5 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(sale.id, !sale.isActive)}>
                                                        {sale.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(sale.id)}
                                                    >
                                                        <Trash2 className="size-3.5 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateSaleDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />
        </EntityListPage>
    );
}
