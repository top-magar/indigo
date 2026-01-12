"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/features/products/types";
import { deleteVariant } from "@/app/dashboard/products/product-actions";
import { CreateVariantDialog } from "./create-variant-dialog";
import { EditVariantDialog } from "./edit-variant-dialog";
import { cn } from "@/shared/utils";

interface ProductVariantsCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductVariantsCard({ product, onUpdate }: ProductVariantsCardProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "—";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: product.currency || "USD",
        }).format(value);
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) {
            return { label: "Out", color: "text-destructive", bgColor: "bg-destructive/10" };
        }
        if (quantity <= 10) {
            return { label: "Low", color: "text-chart-4", bgColor: "bg-chart-4/10" };
        }
        return { label: "In Stock", color: "text-chart-2", bgColor: "bg-chart-2/10" };
    };

    const handleDelete = async (variantId: string) => {
        const result = await deleteVariant(variantId);
        if (result.success) {
            toast.success("Variant deleted");
            onUpdate?.();
        } else {
            toast.error(result.error || "Failed to delete variant");
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Variants
                        {product.variants.length > 0 && (
                            <span className="ml-2 text-muted-foreground font-normal">
                                ({product.variants.length})
                            </span>
                        )}
                    </CardTitle>
                    <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                    </Button>
                </CardHeader>
                <CardContent>
                    {product.variants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No variants yet</p>
                            <p className="text-sm">Add variants for different sizes, colors, etc.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.variants.map((variant) => {
                                    const stockStatus = getStockStatus(variant.quantity);
                                    return (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{variant.title}</p>
                                                    {variant.options.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {variant.options.map((opt, i) => (
                                                                <Badge key={i} variant="outline" className="text-xs">
                                                                    {opt.name}: {opt.value}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {variant.sku || "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(variant.price || product.price)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span>{variant.quantity}</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("border-0 text-xs", stockStatus.bgColor, stockStatus.color)}
                                                    >
                                                        {stockStatus.label}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingVariant(variant)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(variant.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateVariantDialog
                productId={product.id}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={onUpdate}
            />

            {editingVariant && (
                <EditVariantDialog
                    variant={editingVariant}
                    open={!!editingVariant}
                    onOpenChange={(open) => !open && setEditingVariant(null)}
                    onSuccess={onUpdate}
                />
            )}
        </>
    );
}
