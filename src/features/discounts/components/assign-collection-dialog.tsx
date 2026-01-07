"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Folder01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { getCollectionsForDiscount } from "@/app/dashboard/marketing/actions";

interface Collection {
    id: string;
    name: string;
    slug: string;
    product_count: number;
}

interface AssignCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    excludeIds: string[];
    onAssign: (collectionIds: string[]) => void;
}

export function AssignCollectionDialog({
    open,
    onOpenChange,
    excludeIds,
    onAssign,
}: AssignCollectionDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch collections when dialog opens
    useEffect(() => {
        if (open) {
            setIsLoading(true);
            startTransition(async () => {
                const result = await getCollectionsForDiscount();
                if (result.collections) {
                    setCollections(result.collections);
                }
                setIsLoading(false);
            });
        }
    }, [open]);

    const availableCollections = collections.filter(
        (c) => !excludeIds.includes(c.id)
    );

    const filteredCollections = availableCollections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        onAssign(selectedIds);
        setSelectedIds([]);
        setSearchQuery("");
    };

    const handleClose = () => {
        onOpenChange(false);
        setSelectedIds([]);
        setSearchQuery("");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Collections</DialogTitle>
                    <DialogDescription>
                        Select collections to apply this discount to all their products
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
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

                    <ScrollArea className="h-[300px] border rounded-lg">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <HugeiconsIcon icon={Loading03Icon} className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredCollections.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                {availableCollections.length === 0 ? "No collections available" : "No collections found"}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredCollections.map((collection) => (
                                    <label
                                        key={collection.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(collection.id)}
                                            onCheckedChange={() => toggleSelect(collection.id)}
                                        />
                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                            <HugeiconsIcon
                                                icon={Folder01Icon}
                                                className="w-4 h-4 text-muted-foreground"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{collection.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {collection.product_count} products
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {selectedIds.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {selectedIds.length} collections selected
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={selectedIds.length === 0 || isPending}>
                        Assign {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Collections
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
