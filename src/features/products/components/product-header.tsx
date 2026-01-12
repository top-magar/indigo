"use client";

import Link from "next/link";
import {
    ArrowLeft,
    MoreHorizontal,
    Trash,
    Eye,
    Archive,
    Check,
    Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyableText } from "@/components/ui/copyable-text";
import { format } from "date-fns";
import type { Product, ProductStatus } from "@/features/products/types";
import { cn } from "@/shared/utils";

interface ProductHeaderProps {
    product: Product;
    onStatusChange?: (status: ProductStatus) => void;
    onDelete?: () => void;
}

const statusConfig: Record<ProductStatus, { color: string; bgColor: string; label: string }> = {
    draft: { color: "text-[var(--ds-gray-600)]", bgColor: "bg-[var(--ds-gray-100)]", label: "Draft" },
    active: { color: "text-[var(--ds-green-700)]", bgColor: "bg-[var(--ds-green-100)]", label: "Active" },
    archived: { color: "text-[var(--ds-amber-700)]", bgColor: "bg-[var(--ds-amber-100)]", label: "Archived" },
};

export function ProductHeader({ product, onStatusChange, onDelete }: ProductHeaderProps) {
    const status = statusConfig[product.status] || statusConfig.draft;

    const handleViewStorefront = () => {
        // Open product in storefront
        window.open(`/store/${product.slug}`, "_blank");
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-[var(--ds-gray-600)]">
                        <span>Created {format(new Date(product.createdAt), "PPP")}</span>
                        {product.sku && (
                            <>
                                <span>·</span>
                                <span>SKU:</span>
                                <CopyableText 
                                    text={product.sku} 
                                    mono 
                                    size="sm"
                                    tooltipText="Copy SKU"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Status Badge */}
                <Badge variant="secondary" className={cn("border-0", status.bgColor, status.color)}>
                    {status.label}
                </Badge>

                {/* View in Store */}
                {product.status === "active" && (
                    <Button variant="outline" size="sm" onClick={handleViewStorefront}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {product.status === "draft" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("active")}>
                                <Check className="h-4 w-4 mr-2" />
                                Publish
                            </DropdownMenuItem>
                        )}
                        {product.status === "active" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <Edit className="h-4 w-4 mr-2" />
                                Unpublish
                            </DropdownMenuItem>
                        )}
                        {product.status !== "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("archived")}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                            </DropdownMenuItem>
                        )}
                        {product.status === "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <Edit className="h-4 w-4 mr-2" />
                                Restore to Draft
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
