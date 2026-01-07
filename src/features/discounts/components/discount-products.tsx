"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete01Icon,
    Search01Icon,
    Image01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { AssignProductDialog } from "@/features/discounts/components/assign-product-dialog";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    thumbnail: string | null;
    productType: string;
    isAvailable: boolean;
}

interface DiscountProductsProps {
    discountId: string;
    products: Product[];
    onProductAssign: (productIds: string[]) => void;
    onProductUnassign: (productId: string) => void;
    onBulkUnassign: (productIds: string[]) => void;
}

export function DiscountProducts({
    products,
    onProductAssign,
    onProductUnassign,
    onBulkUnassign,
}: DiscountProductsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map((p) => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBulkUnassign = () => {
        onBulkUnassign(selectedIds);
        setSelectedIds([]);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Products</CardTitle>
                    <Button onClick={() => setAssignDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                        Assign Products
                    </Button>
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
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkUnassign}
                        >
                            Remove {selectedIds.length} products
                        </Button>
                    )}
                </div>

                {/* Products table */}
                {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No products assigned. Assign products to apply this discount.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(product.id)}
                                                onCheckedChange={() => toggleSelect(product.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden relative">
                                                    {product.thumbnail ? (
                                                        <Image
                                                            src={product.thumbnail}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <HugeiconsIcon
                                                            icon={Image01Icon}
                                                            className="w-4 h-4 text-muted-foreground"
                                                        />
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/dashboard/products/${product.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {product.productType}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-sm ${product.isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                                                {product.isAvailable ? "Available" : "Unavailable"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onProductUnassign(product.id)}
                                            >
                                                <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Summary */}
                <div className="text-sm text-muted-foreground">
                    {products.length} products assigned
                </div>
            </CardContent>

            <AssignProductDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                excludeIds={products.map((p) => p.id)}
                onAssign={(ids) => {
                    onProductAssign(ids);
                    setAssignDialogOpen(false);
                }}
            />
        </Card>
    );
}
