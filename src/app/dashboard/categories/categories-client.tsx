"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete02Icon,
    PencilEdit01Icon,
    Search01Icon,
    GridIcon,
    MoreHorizontalIcon,
    ArrowRight01Icon,
    ArrowDown01Icon,
    ArrowUp01Icon,
    Copy01Icon,
    FolderOpenIcon,
    Package01Icon,
    Layers01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CategoryDialog } from "./category-dialog";
import { deleteCategory, bulkDeleteCategories, updateCategoryOrder } from "./actions";
import type { CategoryWithCount } from "./actions";
import type { Category } from "@/infrastructure/supabase/types";

interface CategoriesClientProps {
    categories: CategoryWithCount[];
}

interface TreeNode extends CategoryWithCount {
    children: TreeNode[];
    level: number;
}

export function CategoriesClient({ categories: initialCategories }: CategoriesClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState(initialCategories);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(categories.map(c => c.id)));
    const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");

    // Build tree structure
    const buildTree = useMemo(() => {
        const nodeMap = new Map<string, TreeNode>();
        const roots: TreeNode[] = [];

        // Create nodes
        categories.forEach(cat => {
            nodeMap.set(cat.id, { ...cat, children: [], level: 0 });
        });

        // Build hierarchy
        categories.forEach(cat => {
            const node = nodeMap.get(cat.id)!;
            if (cat.parent_id && nodeMap.has(cat.parent_id)) {
                const parent = nodeMap.get(cat.parent_id)!;
                node.level = parent.level + 1;
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        });

        // Sort children by sort_order
        const sortChildren = (nodes: TreeNode[]) => {
            nodes.sort((a, b) => a.sort_order - b.sort_order);
            nodes.forEach(n => sortChildren(n.children));
        };
        sortChildren(roots);

        return roots;
    }, [categories]);

    // Flatten tree for display
    const flattenTree = (nodes: TreeNode[], result: TreeNode[] = []): TreeNode[] => {
        nodes.forEach(node => {
            result.push(node);
            if (expandedIds.has(node.id) && node.children.length > 0) {
                flattenTree(node.children, result);
            }
        });
        return result;
    };

    // Filter categories
    const filteredCategories = useMemo(() => {
        if (!searchQuery) {
            return viewMode === "tree" ? flattenTree(buildTree) : categories;
        }
        
        const query = searchQuery.toLowerCase();
        return categories.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.slug.toLowerCase().includes(query)
        );
    }, [categories, searchQuery, buildTree, expandedIds, viewMode]);

    // Stats
    const stats = useMemo(() => {
        const total = categories.length;
        const withProducts = categories.filter(c => c.products_count > 0).length;
        const empty = categories.filter(c => c.products_count === 0).length;
        const nested = categories.filter(c => c.parent_id).length;
        const totalProducts = categories.reduce((sum, c) => sum + c.products_count, 0);
        return { total, withProducts, empty, nested, totalProducts };
    }, [categories]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelect = (id: string) => {
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

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredCategories.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCategories.map(c => c.id)));
        }
    };

    const handleEdit = (category: CategoryWithCount) => {
        setEditingCategory(category);
        setDialogOpen(true);
    };

    const handleCreate = (parentId?: string) => {
        setEditingCategory(parentId ? { parent_id: parentId } as CategoryWithCount : null);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        startTransition(async () => {
            const result = await deleteCategory(categoryToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
                toast.success("Category deleted");
            }
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        });
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            const result = await bulkDeleteCategories(Array.from(selectedIds));
            if (result.error) {
                toast.error(result.error);
            } else {
                setCategories(prev => prev.filter(c => !selectedIds.has(c.id)));
                toast.success(`Deleted ${result.deletedCount} categories`);
                setSelectedIds(new Set());
            }
            setBulkDeleteDialogOpen(false);
        });
    };

    const handleMoveUp = async (category: CategoryWithCount, index: number) => {
        const siblings = categories.filter(c => c.parent_id === category.parent_id);
        const siblingIndex = siblings.findIndex(c => c.id === category.id);
        if (siblingIndex <= 0) return;

        const prevSibling = siblings[siblingIndex - 1];
        const updates = [
            { id: category.id, sort_order: prevSibling.sort_order, parent_id: category.parent_id },
            { id: prevSibling.id, sort_order: category.sort_order, parent_id: prevSibling.parent_id },
        ];

        // Optimistic update
        setCategories(prev => prev.map(c => {
            if (c.id === category.id) return { ...c, sort_order: prevSibling.sort_order };
            if (c.id === prevSibling.id) return { ...c, sort_order: category.sort_order };
            return c;
        }));

        startTransition(async () => {
            const result = await updateCategoryOrder(updates);
            if (result.error) {
                toast.error(result.error);
                setCategories(initialCategories);
            }
        });
    };

    const handleMoveDown = async (category: CategoryWithCount, index: number) => {
        const siblings = categories.filter(c => c.parent_id === category.parent_id);
        const siblingIndex = siblings.findIndex(c => c.id === category.id);
        if (siblingIndex >= siblings.length - 1) return;

        const nextSibling = siblings[siblingIndex + 1];
        const updates = [
            { id: category.id, sort_order: nextSibling.sort_order, parent_id: category.parent_id },
            { id: nextSibling.id, sort_order: category.sort_order, parent_id: nextSibling.parent_id },
        ];

        // Optimistic update
        setCategories(prev => prev.map(c => {
            if (c.id === category.id) return { ...c, sort_order: nextSibling.sort_order };
            if (c.id === nextSibling.id) return { ...c, sort_order: category.sort_order };
            return c;
        }));

        startTransition(async () => {
            const result = await updateCategoryOrder(updates);
            if (result.error) {
                toast.error(result.error);
                setCategories(initialCategories);
            }
        });
    };

    const handleDialogSuccess = (category: Category, isNew: boolean) => {
        if (isNew) {
            const newCat: CategoryWithCount = {
                ...category,
                products_count: 0,
                children_count: 0,
            };
            setCategories(prev => [...prev, newCat]);
            // Auto-expand parent if exists
            if (category.parent_id) {
                setExpandedIds(prev => new Set([...prev, category.parent_id!]));
            }
        } else {
            setCategories(prev => prev.map(c => 
                c.id === category.id 
                    ? { ...c, ...category }
                    : c
            ));
        }
        setDialogOpen(false);
        setEditingCategory(null);
        router.refresh();
    };

    const expandAll = () => setExpandedIds(new Set(categories.map(c => c.id)));
    const collapseAll = () => setExpandedIds(new Set());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">
                        Organize products with hierarchical categories
                    </p>
                </div>
                <Button onClick={() => handleCreate()}>
                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                    Create Category
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={GridIcon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">With Products</p>
                                <p className="text-2xl font-bold text-chart-2">{stats.withProducts}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Package01Icon} className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Empty</p>
                                <p className="text-2xl font-bold text-muted-foreground">{stats.empty}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                                <HugeiconsIcon icon={FolderOpenIcon} className="w-5 h-5 text-chart-3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Nested</p>
                                <p className="text-2xl font-bold text-chart-4">{stats.nested}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Layers01Icon} className="w-5 h-5 text-chart-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-label text-muted-foreground">Products</p>
                                <p className="text-2xl font-bold text-chart-1">{stats.totalProducts}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Package01Icon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setBulkDeleteDialogOpen(true)}
                        >
                            <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                            Delete ({selectedIds.size})
                        </Button>
                    )}
                    
                    {!searchQuery && viewMode === "tree" && (
                        <>
                            <Button variant="outline" size="sm" onClick={expandAll}>
                                Expand All
                            </Button>
                            <Button variant="outline" size="sm" onClick={collapseAll}>
                                Collapse All
                            </Button>
                        </>
                    )}
                    
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant={viewMode === "tree" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-r-none"
                            onClick={() => setViewMode("tree")}
                        >
                            <HugeiconsIcon icon={Layers01Icon} className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "flat" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-l-none"
                            onClick={() => setViewMode("flat")}
                        >
                            <HugeiconsIcon icon={GridIcon} className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <Card>
                <CardContent className="p-0">
                    {filteredCategories.length === 0 ? (
                        <EmptyState
                            icon={GridIcon}
                            title={searchQuery ? "No categories match your search" : "No categories yet"}
                            description={searchQuery
                                ? "Try adjusting your search"
                                : "Create your first category to organize products"}
                            action={!searchQuery ? {
                                label: "Create Category",
                                onClick: () => handleCreate(),
                            } : undefined}
                            size="lg"
                            className="py-16"
                        />
                    ) : (
                        <div className="divide-y">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                                <Checkbox
                                    checked={selectedIds.size === filteredCategories.length && filteredCategories.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                                <span className="text-sm font-medium flex-1">Category</span>
                                <span className="text-sm font-medium w-24 text-center hidden md:block">Products</span>
                                <span className="text-sm font-medium w-20 text-center hidden md:block">Order</span>
                                <span className="w-10"></span>
                            </div>
                            
                            {/* Rows */}
                            {filteredCategories.map((category, index) => {
                                const hasChildren = categories.some(c => c.parent_id === category.id);
                                const isExpanded = expandedIds.has(category.id);
                                const level = viewMode === "tree" && !searchQuery ? (category as TreeNode).level || 0 : 0;
                                
                                return (
                                    <div
                                        key={category.id}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group",
                                            selectedIds.has(category.id) && "bg-muted/50"
                                        )}
                                        style={{ paddingLeft: `${16 + level * 24}px` }}
                                    >
                                        <Checkbox
                                            checked={selectedIds.has(category.id)}
                                            onCheckedChange={() => toggleSelect(category.id)}
                                            aria-label={`Select ${category.name}`}
                                        />
                                        
                                        {/* Expand/Collapse */}
                                        {viewMode === "tree" && !searchQuery && (
                                            <button
                                                onClick={() => toggleExpand(category.id)}
                                                className={cn(
                                                    "p-1 rounded hover:bg-muted transition-colors",
                                                    !hasChildren && "invisible"
                                                )}
                                                aria-label={isExpanded ? "Collapse" : "Expand"}
                                            >
                                                <HugeiconsIcon
                                                    icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                                                    className="w-4 h-4"
                                                />
                                            </button>
                                        )}
                                        
                                        {/* Image */}
                                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <HugeiconsIcon icon={GridIcon} className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Info */}
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate hover:underline">{category.name}</p>
                                                {hasChildren && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {category.children_count} sub
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                /{category.slug}
                                            </p>
                                        </div>
                                        
                                        {/* Products count */}
                                        <div className="w-24 text-center hidden md:block">
                                            <Badge
                                                className={cn(
                                                    "border-0",
                                                    category.products_count > 0
                                                        ? "bg-chart-2/10 text-chart-2"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {category.products_count} product{category.products_count !== 1 ? "s" : ""}
                                            </Badge>
                                        </div>
                                        
                                        {/* Reorder */}
                                        <div className="w-20 items-center justify-center gap-1 hidden md:flex">
                                            <button
                                                onClick={() => handleMoveUp(category, index)}
                                                disabled={isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Move up"
                                            >
                                                <HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(category, index)}
                                                disabled={isPending}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Move down"
                                            >
                                                <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/categories/${category.id}`)}>
                                                    <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCreate(category.id)}>
                                                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                                                    Add Subcategory
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setCategoryToDelete(category);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={hasChildren}
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                                                    Delete
                                                    {hasChildren && (
                                                        <span className="ml-auto text-xs">(has children)</span>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Dialog */}
            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={editingCategory}
                categories={categories}
                onSuccess={handleDialogSuccess}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{categoryToDelete?.name}&quot;. 
                            {categoryToDelete?.products_count ? (
                                <span className="block mt-2 text-chart-5">
                                    {categoryToDelete.products_count} product(s) will become uncategorized.
                                </span>
                            ) : null}
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

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} categories?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the selected categories. Categories with subcategories will be skipped.
                            Products in deleted categories will become uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
