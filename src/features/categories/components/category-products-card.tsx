"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Package,
    Search,
    MoreHorizontal,
    Trash2,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import type { Category, CategoryProduct } from "@/app/dashboard/categories/types";
import { removeProductFromCategory } from "@/app/dashboard/categories/category-actions";

interface CategoryProductsCardProps {
    category: Category;
    onUpdate?: (data: Partial<Category>) => void;
}

export function CategoryProductsCard({ category, onUpdate }: CategoryProductsCardProps) {
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<CategoryProduct[]>(category.products || []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveProduct = (productId: string) => {
        startTransition(async () => {
            const result = await removeProductFromCategory(productId, category.id);
            if (result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success("Product removed from category");
                onUpdate?.({ productCount: products.length - 1 });
            } else {
                toast.error(result.error || "Failed to remove product");
            }
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const statusColors: Record<string, string> = {
        active: "bg-chart-2/10 text-chart-2",
        draft: "bg-muted text-muted-foreground",
        archived: "bg-chart-4/10 text-chart-4",
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products ({category.productCount})
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/products?category=${category.id}`}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                {products.length > 0 && (
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}

                {/* Products List */}
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchQuery ? "No products match your search" : "No products in this category"}
                        </p>
                        {!searchQuery && (
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/dashboard/products/new">Add Product</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="border rounded-xl divide-y">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                            >
                                {/* Product Image */}
                                <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden shrink-0">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Product Info */}
                                <Link
                                    href={`/dashboard/products/${product.id}`}
                                    className="flex-1 min-w-0 hover:underline"
                                >
                                    <p className="font-medium truncate">{product.name}</p>
                                    {product.sku && (
                                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                    )}
                                </Link>

                                {/* Price */}
                                <span className="text-sm font-medium hidden sm:block">
                                    {formatPrice(product.price)}
                                </span>

                                {/* Status */}
                                <Badge
                                    className={cn(
                                        "border-0 capitalize hidden sm:inline-flex",
                                        statusColors[product.status]
                                    )}
                                >
                                    {product.status}
                                </Badge>

                                {/* Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon-sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/products/${product.id}`}>
                                                <ChevronRight className="h-4 w-4 mr-2" />
                                                View Product
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove from Category
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show more link if there are more products */}
                {category.productCount > products.length && (
                    <div className="text-center">
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/products?category=${category.id}`}>
                                View all {category.productCount} products
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
