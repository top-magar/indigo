"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Savebar } from "@/components/dashboard";
import { useFormDirty } from "@/hooks";
import type { Product, ProductStatus } from "../types";
import { deleteProduct, updateProductStatus, updateProduct } from "../actions";
import {
    ProductHeader,
    ProductInfoCard,
    ProductMediaCard,
    ProductPricingCard,
    ProductInventoryCard,
    ProductOrganizationCard,
    ProductShippingCard,
    ProductSeoCard,
    ProductVariantsCard,
} from "../components";

interface ProductDetailClientProps {
    initialProduct: Product;
}

export function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
    const router = useRouter();
    const [product, setProduct] = useState(initialProduct);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Track form dirty state for the Savebar
    const { isDirty, setField, reset, markClean, data: formData } = useFormDirty({
        initialData: {
            name: product.name,
            description: product.description || "",
            status: product.status,
        },
        confirmOnLeave: true,
    });

    // Sync form data when product changes
    useEffect(() => {
        reset();
    }, [product.id]);

    const handleRefresh = useCallback(() => {
        router.refresh();
    }, [router]);

    const handleStatusChange = async (status: ProductStatus) => {
        const result = await updateProductStatus(product.id, status);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Product ${status === "active" ? "published" : status === "archived" ? "archived" : "unpublished"}`);
            setProduct({ ...product, status });
            router.refresh();
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("productId", product.id);
            form.append("name", formData.name);
            form.append("description", formData.description);
            form.append("status", formData.status);

            const result = await updateProduct(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Product saved");
                markClean();
                setProduct({ ...product, ...formData });
                router.refresh();
            }
        } catch {
            toast.error("Failed to save product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const form = new FormData();
            form.append("productId", product.id);
            const result = await deleteProduct(form);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Product deleted");
                router.push("/dashboard/products");
            }
        } catch {
            toast.error("Failed to delete product");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <ProductHeader
                product={product}
                onStatusChange={handleStatusChange}
                onDelete={() => setDeleteDialogOpen(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <ProductInfoCard product={product} onUpdate={handleRefresh} />
                    <ProductMediaCard product={product} onUpdate={handleRefresh} />
                    <ProductPricingCard product={product} onUpdate={handleRefresh} />
                    <ProductInventoryCard product={product} onUpdate={handleRefresh} />
                    {product.hasVariants && (
                        <ProductVariantsCard product={product} onUpdate={handleRefresh} />
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    <ProductOrganizationCard product={product} onUpdate={handleRefresh} />
                    <ProductShippingCard product={product} onUpdate={handleRefresh} />
                    <ProductSeoCard product={product} onUpdate={handleRefresh} />
                </div>
            </div>

            {/* Savebar - shows when there are unsaved changes */}
            <Savebar
                show={isDirty}
                isSaving={isSaving}
                onDiscard={reset}
                onSave={handleSave}
                onDelete={() => setDeleteDialogOpen(true)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                            All variants and inventory data will also be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
