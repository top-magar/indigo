"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EntityListPage } from "@/components/dashboard/templates";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Pencil,
    Search,
    FolderOpen,
    MoreHorizontal,
    CheckCircle,
    X,
    GripVertical,
    Eye,
    Copy,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { StickyBulkActionsBar } from "@/components/dashboard/bulk-actions-bar";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { CollectionDialog } from "./collection-dialog";
import { deleteCollection, updateCollectionOrder, toggleCollectionStatus } from "./actions";
import type { Collection } from "@/infrastructure/supabase/types";
import { SortableHeader, useClientSort } from "@/components/dashboard/sortable-header";

function CollectionStatusBadge({ isActive }: { isActive: boolean }) {
    const config = isActive
        ? { color: "text-success", bgColor: "bg-success/10", label: "Active" }
        : { color: "text-muted-foreground", bgColor: "bg-muted", label: "Inactive" };
    return <Badge className={cn("border-transparent", config.bgColor, config.color)}>{config.label}</Badge>;
}


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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter collections
    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { sorted: sortedCollections, sort, dir, handleSort } = useClientSort(filteredCollections);

    // Pagination
    const pageCount = Math.ceil(sortedCollections.length / pageSize);
    const paginatedCollections = sortedCollections.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize
    );

    // Stats
    const activeCount = collections.filter(c => c.is_active).length;
    const totalProducts = collections.reduce((sum, c) => sum + (c.products_count || 0), 0);

    // Selection helpers
    const toggleAll = () => {
        if (selectedIds.size === sortedCollections.length && sortedCollections.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedCollections.map(c => c.id)));
        }
    };

    const toggleRow = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Bulk actions
    const handleBulkActivate = () => {
        startTransition(async () => {
            try {
            const ids = Array.from(selectedIds);
            const results = await Promise.all(ids.map(id => toggleCollectionStatus(id, true)));
            const failed = results.filter(r => r.error);
            if (failed.length > 0) {
                toast.error(`Failed to activate ${failed.length} collection(s)`);
            } else {
                setCollections(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, is_active: true } : c));
                toast.success(`${ids.length} collection(s) activated`);
            }
            setSelectedIds(new Set());
            } catch {
                toast.error("Failed to activate collections");
            }
        });
    };

    const handleBulkDeactivate = () => {
        startTransition(async () => {
            try {
            const ids = Array.from(selectedIds);
            const results = await Promise.all(ids.map(id => toggleCollectionStatus(id, false)));
            const failed = results.filter(r => r.error);
            if (failed.length > 0) {
                toast.error(`Failed to deactivate ${failed.length} collection(s)`);
            } else {
                setCollections(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, is_active: false } : c));
                toast.success(`${ids.length} collection(s) deactivated`);
            }
            setSelectedIds(new Set());
            } catch {
                toast.error("Failed to deactivate collections");
            }
        });
    };

    const handleBulkDelete = () => {
        startTransition(async () => {
            try {
            const ids = Array.from(selectedIds);
            const results = await Promise.all(ids.map(id => deleteCollection(id)));
            const failed = results.filter(r => r.error);
            if (failed.length > 0) {
                toast.error(`Failed to delete ${failed.length} collection(s)`);
            } else {
                setCollections(prev => prev.filter(c => !selectedIds.has(c.id)));
                toast.success(`${ids.length} collection(s) deleted`);
            }
            setSelectedIds(new Set());
            } catch {
                toast.error("Failed to delete collections");
            }
        });
    };

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

    // Reset page when search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPageIndex(0);
        setSelectedIds(new Set());
    };

    return (
        <EntityListPage
            title="Collections"
            actions={
                <Button onClick={handleCreate}>
                    <Plus className="size-3.5" />
                    Create Collection
                </Button>
            }

            filters={
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        />
                        <Input
                            aria-label="Search collections" placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            }
        >
            {/* Collections Table */}
            <div className={cn(isPending && "opacity-50 pointer-events-none", "transition-opacity")}>
            <div className="hidden md:block">
            <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedIds.size === sortedCollections.length && sortedCollections.length > 0}
                                    onCheckedChange={toggleAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                            <TableHead><SortableHeader label="Collection" column="name" currentSort={sort} currentDir={dir} onSort={handleSort} /></TableHead>
                            <TableHead className="hidden md:table-cell"><SortableHeader label="Products" column="products_count" currentSort={sort} currentDir={dir} onSort={handleSort} /></TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCollections.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={7} className="h-[300px]">
                                    <EmptyState
                                        icon={FolderOpen}
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
                            paginatedCollections.map((collection, index) => (
                                <TableRow key={collection.id} className="group">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(collection.id)}
                                            onCheckedChange={() => toggleRow(collection.id)}
                                            aria-label={`Select ${collection.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0 || isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUp className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === paginatedCollections.length - 1 || isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown className="size-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
                                        >
                                            <div className="size-9 rounded-lg bg-muted overflow-hidden shrink-0">
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
                                                        <FolderOpen className="size-4 text-muted-foreground" />
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
                                        <CollectionStatusBadge isActive={collection.is_active} />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}`)}>
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(collection)}>
                                                    {collection.is_active ? (
                                                        <>
                                                            <X className="size-3.5" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="size-3.5" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="size-3.5" />
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
                                                    <Trash2 className="size-3.5" />
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
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
                {paginatedCollections.length === 0 ? (
                    <EmptyState
                        icon={FolderOpen}
                        title={searchQuery ? "No collections match your search" : "No collections yet"}
                        description={searchQuery ? "Try adjusting your search" : "Create your first collection to organize products"}
                        action={!searchQuery ? { label: "Create Collection", onClick: handleCreate } : undefined}
                    />
                ) : (
                    paginatedCollections.map((collection) => (
                        <div
                            key={collection.id}
                            className="rounded-lg border p-3 space-y-2 cursor-pointer"
                            onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
                        >
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedIds.has(collection.id)}
                                    onCheckedChange={() => toggleRow(collection.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{collection.name}</p>
                                </div>
                                <CollectionStatusBadge isActive={collection.is_active} />
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" aria-label="More actions"><MoreHorizontal className="size-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}`)}><Pencil className="size-3.5" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(collection)}>
                                                {collection.is_active ? <><X className="size-3.5" />Deactivate</> : <><CheckCircle className="size-3.5" />Activate</>}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setCollectionToDelete(collection); setDeleteDialogOpen(true); }}>
                                                <Trash2 className="size-3.5" />Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{collection.products_count || 0} product{(collection.products_count || 0) !== 1 ? "s" : ""}</span>
                                <Badge variant="secondary" className="capitalize text-[10px]">{collection.type}</Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <StickyBulkActionsBar
                    selectedCount={selectedIds.size}
                    onClear={() => setSelectedIds(new Set())}
                    itemLabel="collection"
                >
                    <Button variant="outline" size="sm" onClick={handleBulkActivate} disabled={isPending}>
                        <CheckCircle className="size-3.5" />
                        Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDeactivate} disabled={isPending}>
                        <X className="size-3.5" />
                        Deactivate
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
                        <Trash2 className="size-3.5" />
                        Delete
                    </Button>
                </StickyBulkActionsBar>
            )}

            {/* Pagination */}
            {sortedCollections.length > 0 && (
                <DataTablePagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    totalItems={sortedCollections.length}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPageIndex(0);
                    }}
                    selectedCount={selectedIds.size}
                />
            )}

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
        </EntityListPage>
    );
}
