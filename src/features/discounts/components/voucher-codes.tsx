"use client";

import { useState } from "react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    MoreHorizontalIcon,
    Delete01Icon,
    Copy01Icon,
    Search01Icon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { VoucherCodesGenerateDialog } from "@/features/discounts/components/voucher-codes-generate-dialog";
import { VoucherCodesManualDialog } from "@/features/discounts/components/voucher-codes-manual-dialog";
import { format } from "date-fns";

interface VoucherCode {
    id: string;
    code: string;
    status: "active" | "used" | "expired" | "deactivated";
    usedCount: number;
    usageLimit: number | null;
    isManuallyCreated: boolean;
    createdAt: Date;
    usedAt: Date | null;
}

interface VoucherCodesProps {
    voucherId: string;
    codes: VoucherCode[];
    singleUse: boolean;
    onCodesGenerate: (quantity: number, prefix: string) => void;
    onCodeAdd: (code: string) => void;
    onCodesDelete: (ids: string[]) => void;
}

export function VoucherCodes({
    codes,
    singleUse,
    onCodesGenerate,
    onCodeAdd,
    onCodesDelete,
}: VoucherCodesProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [manualDialogOpen, setManualDialogOpen] = useState(false);

    const filteredCodes = codes.filter((code) =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCodes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCodes.map((c) => c.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const getStatusBadge = (status: VoucherCode["status"]) => {
        switch (status) {
            case "active":
                return <Badge variant="default">Active</Badge>;
            case "used":
                return <Badge variant="secondary">Used</Badge>;
            case "expired":
                return <Badge variant="destructive">Expired</Badge>;
            case "deactivated":
                return <Badge variant="outline">Deactivated</Badge>;
        }
    };

    const handleDeleteSelected = () => {
        onCodesDelete(selectedIds);
        setSelectedIds([]);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Voucher Codes</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                                Add Codes
                                <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setGenerateDialogOpen(true)}>
                                Generate multiple codes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setManualDialogOpen(true)}>
                                Enter code manually
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and bulk actions */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                        />
                        <Input
                            placeholder="Search codes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelected}
                        >
                            Delete {selectedIds.length} codes
                        </Button>
                    )}
                </div>

                {/* Codes table */}
                {codes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No codes yet. Add codes to allow customers to use this voucher.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === filteredCodes.length && filteredCodes.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCodes.map((code) => (
                                    <TableRow key={code.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(code.id)}
                                                onCheckedChange={() => toggleSelect(code.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                    {code.code}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => copyToClipboard(code.code)}
                                                >
                                                    <HugeiconsIcon icon={Copy01Icon} className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(code.status)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {code.usedCount}
                                                {singleUse ? " / 1" : code.usageLimit ? ` / ${code.usageLimit}` : ""}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {format(code.createdAt, "MMM d, yyyy")}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => copyToClipboard(code.code)}>
                                                        <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5 mr-2" />
                                                        Copy code
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => onCodesDelete([code.id])}
                                                    >
                                                        <HugeiconsIcon icon={Delete01Icon} className="w-3.5 h-3.5 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Summary */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{codes.length} total codes</span>
                    <span>{codes.filter((c) => c.status === "active").length} active</span>
                    <span>{codes.filter((c) => c.status === "used").length} used</span>
                </div>
            </CardContent>

            <VoucherCodesGenerateDialog
                open={generateDialogOpen}
                onOpenChange={setGenerateDialogOpen}
                existingCodesCount={codes.length}
                onSubmit={(data) => {
                    onCodesGenerate(data.quantity, data.prefix);
                    setGenerateDialogOpen(false);
                }}
            />

            <VoucherCodesManualDialog
                open={manualDialogOpen}
                onOpenChange={setManualDialogOpen}
                onSubmit={(code) => {
                    onCodeAdd(code);
                    setManualDialogOpen(false);
                }}
            />
        </Card>
    );
}
