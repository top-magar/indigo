"use client";

import Link from "next/link";
import { ArrowLeft, Trash, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Product, ProductStatus } from "@/features/products/types";

interface ProductHeaderProps {
    product: Product;
    onStatusChange?: (status: ProductStatus) => void;
    onDelete?: () => void;
}

export function ProductHeader({ product, onStatusChange, onDelete }: ProductHeaderProps) {
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Created {format(new Date(product.createdAt), "PPP")}</span>
                        {product.sku && (
                            <>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                                    SKU {product.sku}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {product.status !== "draft" && (
                    <Button variant="outline" size="sm" onClick={() => onStatusChange?.("draft")}>
                        Draft
                    </Button>
                )}
                {product.status !== "active" && (
                    <Button variant="default" size="sm" onClick={() => onStatusChange?.("active")}>
                        Publish
                    </Button>
                )}
                {product.status !== "archived" && (
                    <Button variant="outline" size="sm" onClick={() => onStatusChange?.("archived")}>
                        <Archive className="size-3.5" />
                        Archive
                    </Button>
                )}
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash className="size-3.5" />
                    Delete
                </Button>
            </div>
        </div>
    );
}
