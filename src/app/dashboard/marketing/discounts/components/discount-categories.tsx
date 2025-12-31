"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete01Icon,
    Search01Icon,
    GridIcon,
} from "@hugeicons/core-free-icons";
import { AssignCategoryDialog } from "./assign-category-dialog";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    productsCount: number;
    parentName: string | null;
}

interface DiscountCategoriesProps {
    discountId: string;
    categories: Category[];
    onCategoryAssign: (categoryIds: string[]) => void;
    onCategoryUnassign: (categoryId: string) => void;
    onBulkUnassign: (categoryIds: string[]) => void;
}

export function DiscountCategories({
    categories,
    onCategoryAssign,
    onCategoryUnassign,
    onBulkUnassign,
}: DiscountCategoriesProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCategories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCategories.map((c) => c.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBulkUnassign = () => {
        onBulkUnassign(selectedIds);
        setSelectedIds([]);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Categories</CardTitle>
                    <Button onClick={() => setAssignDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                        Assign Categories
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and bulk actions */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                        />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkUnassign}
                        >
                            Remove {selectedIds.length} categories
                        </Button>
                    )}
                </div>

                {/* Categories table */}
                {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No categories assigned. Assign categories to apply this discount to all products in them.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(category.id)}
                                                onCheckedChange={() => toggleSelect(category.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                    <HugeiconsIcon
                                                        icon={GridIcon}
                                                        className="w-4 h-4 text-muted-foreground"
                                                    />
                                                </div>
                                                <Link
                                                    href={`/dashboard/categories/${category.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {category.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {category.parentName || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {category.productsCount} products
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onCategoryUnassign(category.id)}
                                            >
                                                <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Summary */}
                <div className="text-sm text-muted-foreground">
                    {categories.length} categories assigned
                </div>
            </CardContent>

            <AssignCategoryDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                excludeIds={categories.map((c) => c.id)}
                onAssign={(ids) => {
                    onCategoryAssign(ids);
                    setAssignDialogOpen(false);
                }}
            />
        </Card>
    );
}
