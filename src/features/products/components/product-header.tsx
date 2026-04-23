"use client";

import Link from "next/link";
import { ArrowLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Product } from "@/features/products/types";

interface ProductHeaderProps {
    product: Product;
    onDelete?: () => void;
}

export function ProductHeader({ product, onDelete }: ProductHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold tracking-tight truncate sm:text-xl">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(product.createdAt), "PPP")}</span>
                        {product.sku && (
                            <>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">
                                    {product.sku}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive shrink-0" onClick={onDelete}>
                <Trash className="size-3.5" />
            </Button>
        </div>
    );
}
