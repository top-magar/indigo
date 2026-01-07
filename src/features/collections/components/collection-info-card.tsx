"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Tick01Icon, Cancel01Icon, Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Collection } from "@/app/dashboard/collections/types";
import { updateCollectionInfo } from "@/app/dashboard/collections/collection-actions";

interface CollectionInfoCardProps {
    collection: Collection;
    onUpdate?: (data: Partial<Collection>) => void;
}

export function CollectionInfoCard({ collection, onUpdate }: CollectionInfoCardProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(collection.name);
    const [description, setDescription] = useState(collection.description || "");

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateCollectionInfo(collection.id, { name, description });
            if (result.success) {
                toast.success("Collection updated");
                onUpdate?.({ name, description });
                setIsEditing(false);
            } else {
                toast.error(result.error || "Failed to update");
            }
        });
    };

    const handleCancel = () => {
        setName(collection.name);
        setDescription(collection.description || "");
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">General Information</CardTitle>
                {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
                            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            {isPending ? (
                                <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Collection name"
                        />
                    ) : (
                        <p className="text-sm">{collection.name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this collection..."
                            rows={4}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {collection.description || "No description"}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
