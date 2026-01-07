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
    Folder01Icon,
} from "@hugeicons/core-free-icons";
import { AssignCollectionDialog } from "@/features/discounts/components/assign-collection-dialog";
import Link from "next/link";

interface Collection {
    id: string;
    name: string;
    productsCount: number;
    isPublished: boolean;
}

interface DiscountCollectionsProps {
    discountId: string;
    collections: Collection[];
    onCollectionAssign: (collectionIds: string[]) => void;
    onCollectionUnassign: (collectionId: string) => void;
    onBulkUnassign: (collectionIds: string[]) => void;
}

export function DiscountCollections({
    collections,
    onCollectionAssign,
    onCollectionUnassign,
    onBulkUnassign,
}: DiscountCollectionsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const filteredCollections = collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCollections.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCollections.map((c) => c.id));
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
                    <CardTitle className="text-lg">Collections</CardTitle>
                    <Button onClick={() => setAssignDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                        Assign Collections
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
                            placeholder="Search collections..."
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
                            Remove {selectedIds.length} collections
                        </Button>
                    )}
                </div>

                {/* Collections table */}
                {collections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No collections assigned. Assign collections to apply this discount to all products in them.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === filteredCollections.length && filteredCollections.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Collection</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCollections.map((collection) => (
                                    <TableRow key={collection.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(collection.id)}
                                                onCheckedChange={() => toggleSelect(collection.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                    <HugeiconsIcon
                                                        icon={Folder01Icon}
                                                        className="w-4 h-4 text-muted-foreground"
                                                    />
                                                </div>
                                                <Link
                                                    href={`/dashboard/collections/${collection.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {collection.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {collection.productsCount} products
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-sm ${collection.isPublished ? "text-green-600" : "text-muted-foreground"}`}>
                                                {collection.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onCollectionUnassign(collection.id)}
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
                    {collections.length} collections assigned
                </div>
            </CardContent>

            <AssignCollectionDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                excludeIds={collections.map((c) => c.id)}
                onAssign={(ids) => {
                    onCollectionAssign(ids);
                    setAssignDialogOpen(false);
                }}
            />
        </Card>
    );
}
