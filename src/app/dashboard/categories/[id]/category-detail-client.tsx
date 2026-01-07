"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Category, CategoryBreadcrumb } from "../types";
import {
    CategoryHeader,
    CategoryInfoCard,
    CategoryImageCard,
    CategorySeoCard,
    CategorySubcategoriesCard,
    CategoryProductsCard,
} from "@/features/categories/components";
import { deleteCategoryById } from "../category-actions";

interface CategoryDetailClientProps {
    initialCategory: Category;
    breadcrumbs: CategoryBreadcrumb[];
}

export function CategoryDetailClient({ initialCategory, breadcrumbs }: CategoryDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [category, setCategory] = useState<Category>(initialCategory);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createSubcategoryDialogOpen, setCreateSubcategoryDialogOpen] = useState(false);

    const handleUpdate = (data: Partial<Category>) => {
        setCategory(prev => ({ ...prev, ...data }));
    };

    const handleDelete = () => {
        if (category.subcategoryCount > 0) {
            toast.error("Cannot delete category with subcategories");
            return;
        }

        startTransition(async () => {
            const result = await deleteCategoryById(category.id);
            if (result.success) {
                toast.success("Category deleted");
                router.push(category.parentId ? `/dashboard/categories/${category.parentId}` : "/dashboard/categories");
            } else {
                toast.error(result.error || "Failed to delete category");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <CategoryHeader
                category={category}
                breadcrumbs={breadcrumbs}
                onAddSubcategory={() => setCreateSubcategoryDialogOpen(true)}
                onDelete={() => setDeleteDialogOpen(true)}
            />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <CategoryInfoCard category={category} onUpdate={handleUpdate} />
                    <CategorySubcategoriesCard category={category} onUpdate={handleUpdate} />
                    <CategoryProductsCard category={category} onUpdate={handleUpdate} />
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    <CategoryImageCard category={category} onUpdate={handleUpdate} />
                    <CategorySeoCard category={category} onUpdate={handleUpdate} />
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{category.name}&quot;.
                            {category.productCount > 0 && (
                                <span className="block mt-2 text-chart-5">
                                    {category.productCount} product(s) will become uncategorized.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={category.subcategoryCount > 0}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
