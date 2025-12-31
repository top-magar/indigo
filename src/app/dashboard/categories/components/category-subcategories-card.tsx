"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete01Icon,
    GridIcon,
    MoreHorizontalIcon,
    ArrowRight01Icon,
    Loading01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { toast } from "sonner";
import type { Category, Subcategory } from "../types";
import { createSubcategory, deleteSubcategory } from "../category-actions";

interface CategorySubcategoriesCardProps {
    category: Category;
    onUpdate?: (data: Partial<Category>) => void;
}

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CategorySubcategoriesCard({ category, onUpdate }: CategorySubcategoriesCardProps) {
    const [isPending, startTransition] = useTransition();
    const [subcategories, setSubcategories] = useState<Subcategory[]>(category.subcategories || []);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
    
    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    const handleNameChange = (value: string) => {
        setName(value);
        setSlug(generateSlug(value));
    };

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        startTransition(async () => {
            const result = await createSubcategory(category.id, { name, slug, description });
            if (result.success && result.data) {
                const newSub: Subcategory = {
                    id: result.data.id,
                    name: result.data.name,
                    slug: result.data.slug,
                    description: result.data.description,
                    imageUrl: result.data.image_url,
                    productCount: 0,
                    subcategoryCount: 0,
                    sortOrder: result.data.sort_order || 0,
                    createdAt: result.data.created_at,
                };
                setSubcategories(prev => [...prev, newSub]);
                toast.success("Subcategory created");
                onUpdate?.({ subcategoryCount: subcategories.length + 1 });
                setCreateDialogOpen(false);
                setName("");
                setSlug("");
                setDescription("");
            } else {
                toast.error(result.error || "Failed to create");
            }
        });
    };

    const handleDelete = () => {
        if (!subcategoryToDelete) return;

        startTransition(async () => {
            const result = await deleteSubcategory(subcategoryToDelete.id, category.id);
            if (result.success) {
                setSubcategories(prev => prev.filter(s => s.id !== subcategoryToDelete.id));
                toast.success("Subcategory deleted");
                onUpdate?.({ subcategoryCount: subcategories.length - 1 });
            } else {
                toast.error(result.error || "Failed to delete");
            }
            setDeleteDialogOpen(false);
            setSubcategoryToDelete(null);
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
                        Subcategories ({subcategories.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent>
                    {subcategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <HugeiconsIcon icon={GridIcon} className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">No subcategories</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Add Subcategory
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y border rounded-lg">
                            {subcategories.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                        {sub.imageUrl ? (
                                            <Image
                                                src={sub.imageUrl}
                                                alt={sub.name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <HugeiconsIcon icon={GridIcon} className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Link
                                        href={`/dashboard/categories/${sub.id}`}
                                        className="flex-1 min-w-0 hover:underline"
                                    >
                                        <p className="font-medium truncate">{sub.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {sub.productCount} product{sub.productCount !== 1 ? "s" : ""}
                                            {sub.subcategoryCount > 0 && ` · ${sub.subcategoryCount} sub`}
                                        </p>
                                    </Link>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/categories/${sub.id}`}>
                                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 mr-2" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => {
                                                    setSubcategoryToDelete(sub);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                disabled={sub.subcategoryCount > 0}
                                            >
                                                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Subcategory</DialogTitle>
                        <DialogDescription>
                            Create a new subcategory under {category.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subName">Name</Label>
                            <Input
                                id="subName"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Subcategory name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subSlug">URL Slug</Label>
                            <Input
                                id="subSlug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                placeholder="subcategory-slug"
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subDesc">Description (optional)</Label>
                            <Input
                                id="subDesc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
                            {isPending ? (
                                <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete subcategory?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{subcategoryToDelete?.name}&quot;.
                            Products in this subcategory will become uncategorized.
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
        </>
    );
}
