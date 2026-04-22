"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Trash, Copy, Eye, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Category, CategoryBreadcrumb } from "@/app/dashboard/categories/types";

interface CategoryHeaderProps {
    category: Category;
    breadcrumbs: CategoryBreadcrumb[];
    onAddSubcategory?: () => void;
    onDelete?: () => void;
}

export function CategoryHeader({ category, breadcrumbs, onAddSubcategory, onDelete }: CategoryHeaderProps) {
    const copyId = () => {
        navigator.clipboard.writeText(category.id);
        toast.success("Category ID copied");
    };

    const handleViewStorefront = () => {
        window.open(`/categories/${category.slug}`, "_blank");
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/categories">Categories</BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbs.slice(0, -1).map((crumb) => (
                            <BreadcrumbItem key={crumb.id}>
                                <BreadcrumbSeparator>
                                    <ArrowRight className="size-3.5" />
                                </BreadcrumbSeparator>
                                <BreadcrumbLink href={`/dashboard/categories/${crumb.id}`}>
                                    {crumb.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        ))}
                        <BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <ArrowRight className="size-3.5" />
                            </BreadcrumbSeparator>
                            <BreadcrumbPage>{category.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={category.parentId ? `/dashboard/categories/${category.parentId}` : "/dashboard/categories"}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {category.name}
                            </h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5"
                                onClick={copyId}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created {format(new Date(category.createdAt), "PPP")}
                            {` · ${category.productCount} product${category.productCount !== 1 ? "s" : ""}`}
                            {category.subcategoryCount > 0 && ` · ${category.subcategoryCount} subcategor${category.subcategoryCount !== 1 ? "ies" : "y"}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Level Badge */}
                    {category.level > 0 && (
                        <Badge variant="outline">
                            Level {category.level + 1}
                        </Badge>
                    )}

                    {/* Add Subcategory */}
                    <Button variant="outline" onClick={onAddSubcategory}>
                        <Plus className="size-4" />
                        Add Subcategory
                    </Button>

                    {/* View in Store */}
                    <Button variant="outline" onClick={handleViewStorefront}>
                        <Eye className="size-4" />
                        View
                    </Button>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={onDelete}
                                disabled={category.subcategoryCount > 0}
                            >
                                <Trash className="size-4" />
                                Delete Category
                                {category.subcategoryCount > 0 && (
                                    <span className="ml-auto text-xs">(has children)</span>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
