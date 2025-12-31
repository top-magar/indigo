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
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Ticket01Icon,
    Search01Icon,
    Add01Icon,
    MoreHorizontalIcon,
    Edit01Icon,
    Delete01Icon,
    Copy01Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";
import { CreateVoucherDialog } from "../components/create-voucher-dialog";
import { deleteDiscount, duplicateDiscount, toggleDiscountStatus, deleteDiscounts } from "../actions";
import {
    getDiscountStatus,
    getStatusBadgeVariant,
    getStatusLabel,
    formatDiscountValue,
    formatDateRange,
    formatUsage,
} from "../utils";
import type { Discount } from "../types";
import Link from "next/link";
import { toast } from "sonner";

interface VouchersClientProps {
    initialVouchers: Discount[];
}

export function VouchersClient({ initialVouchers }: VouchersClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const vouchers = initialVouchers;

    const filteredVouchers = vouchers.filter((voucher) => {
        const matchesSearch = voucher.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status = getDiscountStatus(voucher);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const matchesType = typeFilter === "all" || voucher.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredVouchers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredVouchers.map((v) => v.id));
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
                toast.success("Voucher deleted");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete voucher");
            }
        });
    };

    const handleDuplicate = async (id: string) => {
        startTransition(async () => {
            const result = await duplicateDiscount(id);
            if (result.success) {
                toast.success("Voucher duplicated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to duplicate voucher");
            }
        });
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        startTransition(async () => {
            const result = await toggleDiscountStatus(id, isActive);
            if (result.success) {
                toast.success(isActive ? "Voucher activated" : "Voucher deactivated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update voucher");
            }
        });
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            const result = await deleteDiscounts(selectedIds);
            if (result.success) {
                toast.success(`${selectedIds.length} vouchers deleted`);
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete vouchers");
            }
        });
    };

    const handleCreateSuccess = () => {
        setCreateDialogOpen(false);
        router.refresh();
    };

    if (vouchers.length === 0 && !searchQuery && statusFilter === "all" && typeFilter === "all") {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <HugeiconsIcon icon={Ticket01Icon} className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No vouchers yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Create your first voucher to offer discount codes to your customers.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                    Create Voucher
                </Button>
                <CreateVoucherDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Vouchers require customers to enter a code at checkout
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                    Create Voucher
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                    />
                    <Input
                        placeholder="Search vouchers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
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
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isPending}
                    >
                        {isPending && <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />}
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
                                    checked={selectedIds.length === filteredVouchers.length && filteredVouchers.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Voucher</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Valid Period</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVouchers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No vouchers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVouchers.map((voucher) => {
                                const status = getDiscountStatus(voucher);
                                return (
                                    <TableRow key={voucher.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(voucher.id)}
                                                onCheckedChange={() => toggleSelect(voucher.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/dashboard/marketing/discounts/vouchers/${voucher.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {voucher.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {formatDiscountValue(voucher.type, parseFloat(voucher.value))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(status)}>
                                                {getStatusLabel(status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {formatUsage(voucher.usedCount, voucher.usageLimit)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDateRange(voucher.startsAt, voucher.endsAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isPending}>
                                                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/marketing/discounts/vouchers/${voucher.id}`}>
                                                            <HugeiconsIcon icon={Edit01Icon} className="w-3.5 h-3.5 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(voucher.id)}>
                                                        <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(voucher.id, !voucher.isActive)}>
                                                        {voucher.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(voucher.id)}
                                                    >
                                                        <HugeiconsIcon icon={Delete01Icon} className="w-3.5 h-3.5 mr-2" />
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

            <CreateVoucherDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
