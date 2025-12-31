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
import type { Collection } from "../types";
import {
    CollectionHeader,
    CollectionInfoCard,
    CollectionImageCard,
    CollectionSeoCard,
    CollectionProductsCard,
} from "../components";
import { updateCollectionStatus, deleteCollectionById } from "../collection-actions";

interface CollectionDetailClientProps {
    initialCollection: Collection;
}

export function CollectionDetailClient({ initialCollection }: CollectionDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [collection, setCollection] = useState<Collection>(initialCollection);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleUpdate = (data: Partial<Collection>) => {
        setCollection(prev => ({ ...prev, ...data }));
    };

    const handleStatusChange = (isActive: boolean) => {
        startTransition(async () => {
            const result = await updateCollectionStatus(collection.id, isActive);
            if (result.success) {
                setCollection(prev => ({ ...prev, isActive }));
                toast.success(isActive ? "Collection activated" : "Collection deactivated");
            } else {
                toast.error(result.error || "Failed to update status");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteCollectionById(collection.id);
            if (result.success) {
                toast.success("Collection deleted");
                router.push("/dashboard/collections");
            } else {
                toast.error(result.error || "Failed to delete collection");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <CollectionHeader
                collection={collection}
                onStatusChange={handleStatusChange}
                onDelete={() => setDeleteDialogOpen(true)}
            />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <CollectionInfoCard collection={collection} onUpdate={handleUpdate} />
                    <CollectionProductsCard collection={collection} onUpdate={handleUpdate} />
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    <CollectionImageCard collection={collection} onUpdate={handleUpdate} />
                    <CollectionSeoCard collection={collection} onUpdate={handleUpdate} />
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{collection.name}&quot;. 
                            Products in this collection will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
