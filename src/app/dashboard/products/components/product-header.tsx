"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    MoreHorizontalIcon,
    Delete01Icon,
    ViewIcon,
    Archive01Icon,
    Tick01Icon,
    Edit01Icon,
} from "@hugeicons/core-free-icons";
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
import type { Product, ProductStatus } from "../types";
import { cn } from "@/lib/utils";

interface ProductHeaderProps {
    product: Product;
    onStatusChange?: (status: ProductStatus) => void;
    onDelete?: () => void;
}

const statusConfig: Record<ProductStatus, { color: string; bgColor: string; label: string }> = {
    draft: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Draft" },
    active: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Active" },
    archived: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Archived" },
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
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                        <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                        View
                    </Button>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {product.status === "draft" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("active")}>
                                <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 mr-2" />
                                Publish
                            </DropdownMenuItem>
                        )}
                        {product.status === "active" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                Unpublish
                            </DropdownMenuItem>
                        )}
                        {product.status !== "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("archived")}>
                                <HugeiconsIcon icon={Archive01Icon} className="h-4 w-4 mr-2" />
                                Archive
                            </DropdownMenuItem>
                        )}
                        {product.status === "archived" && (
                            <DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
                                <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                Restore to Draft
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
