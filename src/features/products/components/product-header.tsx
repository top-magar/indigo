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

const statusConfig: Record<ProductStatus, { color: string; bgColor: string; dotColor: string; label: string }> = {
    draft: { color: "text-muted-foreground", bgColor: "bg-muted", dotColor: "bg-muted-foreground", label: "Draft" },
    active: { color: "text-success", bgColor: "bg-success/10", dotColor: "bg-success", label: "Active" },
    archived: { color: "text-warning", bgColor: "bg-warning/10", dotColor: "bg-warning", label: "Archived" },
};

export function ProductHeader({ product, onStatusChange, onDelete }: ProductHeaderProps) {
    const status = statusConfig[product.status] || statusConfig.draft;

    const handleViewStorefront = () => {
        // Open product in storefront
        window.open(`/store/${product.slug}`, "_blank");
    };

    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold tracking-tight truncate sm:text-2xl">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <span>Created {format(new Date(product.createdAt), "PPP")}</span>
                        {product.sku && (
                            <>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    SKU
                                    <CopyableText 
                                        text={product.sku} 
                                        mono 
                                        tooltipText="Copy SKU"
                                    />
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Status Badge */}
                <Badge variant="secondary" className={cn("border-0 gap-1.5", status.bgColor, status.color)}>
                    <span className={cn("size-1.5 rounded-full", status.dotColor)} />
                    {status.label}
                </Badge>

                {/* View in Store */}
                {product.status === "active" && (
                    <Button variant="outline" onClick={handleViewStorefront}>
                        <Eye className="size-4" />
                        View
                    </Button>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {product.status === "draft" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("active")}>
                                <Check className="size-4" />
                                Publish
                            </DropdownMenuItem>
                        )}
                        {product.status === "active" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <Edit className="size-4" />
                                Unpublish
                            </DropdownMenuItem>
                        )}
                        {product.status !== "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("archived")}>
                                <Archive className="size-4" />
                                Archive
                            </DropdownMenuItem>
                        )}
                        {product.status === "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <Edit className="size-4" />
                                Restore to Draft
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash className="size-4" />
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
