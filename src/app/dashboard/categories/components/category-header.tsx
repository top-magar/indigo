"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    MoreHorizontalIcon,
    Delete01Icon,
    Copy01Icon,
    ViewIcon,
    Add01Icon,
    ArrowRight01Icon,
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
import type { Category, CategoryBreadcrumb } from "../types";

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
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                                </BreadcrumbSeparator>
                                <BreadcrumbLink href={`/dashboard/categories/${crumb.id}`}>
                                    {crumb.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        ))}
                        <BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
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
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {category.name}
                            </h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={copyId}
                            >
                                <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
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
                    <Button variant="outline" size="sm" onClick={onAddSubcategory}>
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                        Add Subcategory
                    </Button>

                    {/* View in Store */}
                    <Button variant="outline" size="sm" onClick={handleViewStorefront}>
                        <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                        View
                    </Button>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={onDelete}
                                disabled={category.subcategoryCount > 0}
                            >
                                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
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
