"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete02Icon,
    PencilEdit01Icon,
    Search01Icon,
    FolderLibraryIcon,
    MoreHorizontalIcon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    DragDropVerticalIcon,
    ViewIcon,
    Copy01Icon,
    ArrowUp01Icon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { CollectionDialog } from "./collection-dialog";
import { deleteCollection, updateCollectionOrder, toggleCollectionStatus } from "./actions";
import type { Collection } from "@/infrastructure/supabase/types";


interface CollectionsClientProps {
    collections: Collection[];
}

export function CollectionsClient({ collections: initialCollections }: CollectionsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [collections, setCollections] = useState(initialCollections);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

    // Filter collections
    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const activeCount = collections.filter(c => c.is_active).length;
    const totalProducts = collections.reduce((sum, c) => sum + (c.products_count || 0), 0);

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingCollection(null);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!collectionToDelete) return;

        startTransition(async () => {
            const result = await deleteCollection(collectionToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                setCollections(prev => prev.filter(c => c.id !== collectionToDelete.id));
                toast.success("Collection deleted");
            }
            setDeleteDialogOpen(false);
            setCollectionToDelete(null);
        });
    };

    const handleToggleStatus = async (collection: Collection) => {
        startTransition(async () => {
            const result = await toggleCollectionStatus(collection.id, !collection.is_active);
            if (result.error) {
                toast.error(result.error);
            } else {
                setCollections(prev => prev.map(c =>
                    c.id === collection.id ? { ...c, is_active: !c.is_active } : c
                ));
                toast.success(collection.is_active ? "Collection deactivated" : "Collection activated");
            }
        });
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newCollections = [...collections];
        [newCollections[index - 1], newCollections[index]] = [newCollections[index], newCollections[index - 1]];
        
        // Update sort orders
        const updates = newCollections.map((c, i) => ({ id: c.id, sort_order: i }));
        
        setCollections(newCollections);
        startTransition(async () => {
            const result = await updateCollectionOrder(updates);
            if (result.error) {
                toast.error(result.error);
                setCollections(initialCollections);
            }
        });
    };

    const handleMoveDown = async (index: number) => {
        if (index === collections.length - 1) return;
        const newCollections = [...collections];
        [newCollections[index], newCollections[index + 1]] = [newCollections[index + 1], newCollections[index]];
        
        const updates = newCollections.map((c, i) => ({ id: c.id, sort_order: i }));
        
        setCollections(newCollections);
        startTransition(async () => {
            const result = await updateCollectionOrder(updates);
            if (result.error) {
                toast.error(result.error);
                setCollections(initialCollections);
            }
        });
    };

    const handleDialogSuccess = (collection: Collection, isNew: boolean) => {
        if (isNew) {
            setCollections(prev => [...prev, collection]);
        } else {
            setCollections(prev => prev.map(c => c.id === collection.id ? collection : c));
        }
        setDialogOpen(false);
        setEditingCollection(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground">
                        Organize products into collections for better discoverability
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                    Create Collection
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{collections.length}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={FolderLibraryIcon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-chart-2">{activeCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Inactive</p>
                                <p className="text-2xl font-bold text-muted-foreground">{collections.length - activeCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5 text-chart-3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Products</p>
                                <p className="text-2xl font-bold text-chart-1">{totalProducts}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={ViewIcon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Collections Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Collection</TableHead>
                            <TableHead className="hidden md:table-cell">Products</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCollections.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="h-[300px]">
                                    <EmptyState
                                        icon={FolderLibraryIcon}
                                        title={searchQuery ? "No collections match your search" : "No collections yet"}
                                        description={searchQuery
                                            ? "Try adjusting your search"
                                            : "Create your first collection to organize products"}
                                        action={!searchQuery ? {
                                            label: "Create Collection",
                                            onClick: handleCreate,
                                        } : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCollections.map((collection, index) => (
                                <TableRow key={collection.id} className="group">
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0 || isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <HugeiconsIcon icon={ArrowUp01Icon} className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === filteredCollections.length - 1 || isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
                                        >
                                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                                {collection.image_url ? (
                                                    <Image
                                                        src={collection.image_url}
                                                        alt={collection.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <HugeiconsIcon icon={FolderLibraryIcon} className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate hover:underline">{collection.name}</p>
                                                {collection.description && (
                                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                        {collection.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="text-muted-foreground">
                                            {collection.products_count || 0} product{(collection.products_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="secondary" className="capitalize">
                                            {collection.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                "border-0",
                                                collection.is_active
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {collection.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}`)}>
                                                    <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(collection)}>
                                                    {collection.is_active ? (
                                                        <>
                                                            <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setCollectionToDelete(collection);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Collection Dialog */}
            <CollectionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                collection={editingCollection}
                onSuccess={handleDialogSuccess}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{collectionToDelete?.name}&quot;. Products in this collection will not be deleted.
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
